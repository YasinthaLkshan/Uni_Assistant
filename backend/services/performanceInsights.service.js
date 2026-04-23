import Attendance from "../models/Attendance.js";
import Feedback from "../models/Feedback.js";
import TimetableEntry from "../models/TimetableEntry.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { resolveLecturerModules } from "./lecturer.service.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const avg = (arr) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);
const round1 = (n) => Math.round(n * 10) / 10;

// ─── Get Lecturer's Timetable Entries ────────────────────────────────────────

const getLecturerEntries = async (lecturerId) => {
  const modules = await resolveLecturerModules(lecturerId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const entries = await TimetableEntry.find({ moduleCode: { $in: moduleCodes } })
    .sort({ moduleCode: 1, dayOfWeek: 1, startTime: 1 })
    .lean();

  return { entries, modules };
};

// ─── Mark Attendance ─────────────────────────────────────────────────────────

export const getSessionStudents = async (lecturerId, entryId, dateStr) => {
  const entry = await TimetableEntry.findById(entryId).lean();
  if (!entry) throw new AppError("Timetable entry not found", 404);

  // Verify lecturer owns this entry
  const modules = await resolveLecturerModules(lecturerId);
  const owned = modules.some((m) => m.moduleCode === entry.moduleCode);
  if (!owned) throw new AppError("You are not assigned to this module", 403);

  // Students in this group
  const students = await User.find({
    role: "student",
    groupNumber: entry.groupNumber,
  })
    .select("name studentId email")
    .sort({ name: 1 })
    .lean();

  if (students.length === 0) {
    return { entry, date: dateStr, students: [] };
  }

  // Existing attendance records for this session+date
  const sessionDate = new Date(dateStr);
  const nextDay = new Date(sessionDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const existing = await Attendance.find({
    timetableEntry: entryId,
    date: { $gte: sessionDate, $lt: nextDay },
    user: { $in: students.map((s) => s._id) },
  }).lean();

  const statusMap = {};
  for (const rec of existing) {
    statusMap[String(rec.user)] = rec.status;
  }

  return {
    entry,
    date: dateStr,
    students: students.map((s) => ({
      _id: s._id,
      name: s.name,
      studentId: s.studentId,
      status: statusMap[String(s._id)] || null, // null = not marked yet
    })),
  };
};

export const markAttendance = async (lecturerId, payload) => {
  const { entryId, date: dateStr, records } = payload;

  if (!entryId || !dateStr || !Array.isArray(records) || records.length === 0) {
    throw new AppError("entryId, date, and records are required", 400);
  }

  const entry = await TimetableEntry.findById(entryId).lean();
  if (!entry) throw new AppError("Timetable entry not found", 404);

  const modules = await resolveLecturerModules(lecturerId);
  const owned = modules.some((m) => m.moduleCode === entry.moduleCode);
  if (!owned) throw new AppError("You are not assigned to this module", 403);

  const sessionDate = new Date(dateStr);
  const ops = records.map(({ studentId, status }) => ({
    updateOne: {
      filter: { user: studentId, timetableEntry: entryId, date: sessionDate },
      update: {
        $set: {
          user: studentId,
          timetableEntry: entryId,
          date: sessionDate,
          status: status || "Present",
          markedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);
  return { marked: records.length };
};

// ─── Attendance Rate Per Module ───────────────────────────────────────────────

const getAttendanceByModule = async (entries) => {
  if (entries.length === 0) return [];

  const entryIds = entries.map((e) => e._id);

  const records = await Attendance.find({
    timetableEntry: { $in: entryIds },
  }).lean();

  // Group records by timetableEntry
  const byEntry = {};
  for (const r of records) {
    const key = String(r.timetableEntry);
    if (!byEntry[key]) byEntry[key] = [];
    byEntry[key].push(r);
  }

  // Group entries by moduleCode
  const byModule = {};
  for (const entry of entries) {
    const mc = entry.moduleCode;
    if (!byModule[mc]) {
      byModule[mc] = {
        moduleCode: mc,
        moduleName: entry.moduleName,
        activityType: entry.activityType,
        dayOfWeek: entry.dayOfWeek,
        sessions: [],
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalMarked: 0,
      };
    }

    const entryRecords = byEntry[String(entry._id)] || [];
    if (entryRecords.length === 0) continue;

    // Group by date to get per-session stats
    const byDate = {};
    for (const r of entryRecords) {
      const d = r.date.toISOString().split("T")[0];
      if (!byDate[d]) byDate[d] = { present: 0, absent: 0, late: 0, total: 0 };
      if (r.status === "Present") byDate[d].present++;
      else if (r.status === "Absent") byDate[d].absent++;
      else if (r.status === "Late") byDate[d].late++;
      byDate[d].total++;
    }

    for (const [date, stats] of Object.entries(byDate)) {
      const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;
      byModule[mc].sessions.push({ date, ...stats, rate });
      byModule[mc].totalPresent += stats.present;
      byModule[mc].totalAbsent += stats.absent;
      byModule[mc].totalLate += stats.late;
      byModule[mc].totalMarked += stats.total;
    }
  }

  return Object.values(byModule).map((m) => {
    const attended = m.totalPresent + m.totalLate;
    const attendanceRate = m.totalMarked > 0 ? Math.round((attended / m.totalMarked) * 100) : null;
    const sessions = [...m.sessions].sort((a, b) => a.date.localeCompare(b.date));

    // Trend: compare first half vs second half of sessions
    let trend = "no data";
    if (sessions.length >= 2) {
      const mid = Math.floor(sessions.length / 2);
      const firstHalf = avg(sessions.slice(0, mid).map((s) => s.rate));
      const secondHalf = avg(sessions.slice(mid).map((s) => s.rate));
      if (secondHalf - firstHalf > 5) trend = "improving";
      else if (firstHalf - secondHalf > 5) trend = "declining";
      else trend = "stable";
    }

    return {
      moduleCode: m.moduleCode,
      moduleName: m.moduleName,
      attendanceRate,
      totalSessions: sessions.length,
      totalStudentMarks: m.totalMarked,
      trend,
      sessions,
    };
  });
};

// ─── Day-of-Week Analysis ─────────────────────────────────────────────────────

const getDayAnalysis = async (entries) => {
  if (entries.length === 0) return [];

  const entryIds = entries.map((e) => e._id);
  const records = await Attendance.find({ timetableEntry: { $in: entryIds } }).lean();

  const entryDayMap = {};
  for (const e of entries) {
    entryDayMap[String(e._id)] = e.dayOfWeek;
  }

  const dayStats = {};
  for (const r of records) {
    const day = entryDayMap[String(r.timetableEntry)];
    if (!day) continue;
    if (!dayStats[day]) dayStats[day] = { present: 0, total: 0 };
    if (r.status === "Present" || r.status === "Late") dayStats[day].present++;
    dayStats[day].total++;
  }

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayOrder
    .filter((d) => dayStats[d])
    .map((day) => ({
      day,
      attendanceRate: dayStats[day].total > 0
        ? Math.round((dayStats[day].present / dayStats[day].total) * 100)
        : null,
      total: dayStats[day].total,
    }));
};

// ─── Smart Recommendations ────────────────────────────────────────────────────

const generateRecommendations = (moduleStats, dayAnalysis, feedbackSummary) => {
  const recs = [];

  for (const mod of moduleStats) {
    if (mod.attendanceRate === null) continue;

    if (mod.attendanceRate < 60) {
      recs.push({
        type: "critical",
        text: `${mod.moduleCode} has very low attendance (${mod.attendanceRate}%). Consider rescheduling or investigating barriers to attendance.`,
      });
    } else if (mod.attendanceRate < 75) {
      recs.push({
        type: "warning",
        text: `${mod.moduleCode} attendance is below 75% (${mod.attendanceRate}%). Sending reminders before class may help.`,
      });
    }

    if (mod.trend === "declining") {
      recs.push({
        type: "warning",
        text: `Attendance for ${mod.moduleCode} has been declining. Review session times or content engagement.`,
      });
    } else if (mod.trend === "improving") {
      recs.push({
        type: "success",
        text: `${mod.moduleCode} attendance is on an upward trend. Keep up the good work!`,
      });
    }
  }

  // Day analysis
  if (dayAnalysis.length > 1) {
    const worst = [...dayAnalysis].sort((a, b) => (a.attendanceRate ?? 100) - (b.attendanceRate ?? 100))[0];
    if (worst.attendanceRate !== null && worst.attendanceRate < 70) {
      recs.push({
        type: "warning",
        text: `${worst.day} sessions have the lowest attendance (${worst.attendanceRate}%). Consider whether this time slot is convenient for students.`,
      });
    }
    const best = [...dayAnalysis].sort((a, b) => (b.attendanceRate ?? 0) - (a.attendanceRate ?? 0))[0];
    if (best.attendanceRate !== null && best.attendanceRate >= 85) {
      recs.push({
        type: "info",
        text: `${best.day} sessions have the highest attendance (${best.attendanceRate}%). This time slot works well for students.`,
      });
    }
  }

  // Feedback-based recommendations
  if (feedbackSummary && feedbackSummary.total > 0) {
    const { averageRatings } = feedbackSummary;
    if (averageRatings.engagementLevel < 3) {
      recs.push({
        type: "warning",
        text: "Student engagement ratings are low. Try adding interactive elements like polls, Q&A, or group exercises.",
      });
    }
    if (averageRatings.contentClarity < 3) {
      recs.push({
        type: "warning",
        text: "Content clarity is rated below average. Consider providing clearer summaries or revision notes.",
      });
    }
    if (averageRatings.overallRating >= 4.5) {
      recs.push({
        type: "success",
        text: "Students rate your lectures very highly overall. Excellent performance!",
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      type: "info",
      text: "Everything looks good! Keep recording attendance to unlock detailed trend insights.",
    });
  }

  return recs;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const getLecturerPerformanceDashboard = async (lecturerId) => {
  const { entries, modules } = await getLecturerEntries(lecturerId);

  const [moduleStats, dayAnalysis, feedbackSummary] = await Promise.all([
    getAttendanceByModule(entries),
    getDayAnalysis(entries),
    Feedback.find({ lecturer: lecturerId }).lean().then((feedbacks) => {
      const total = feedbacks.length;
      if (total === 0) return { total: 0, averageRatings: {} };
      const sum = feedbacks.reduce(
        (acc, f) => ({
          overallRating: acc.overallRating + f.overallRating,
          teachingQuality: acc.teachingQuality + f.teachingQuality,
          contentClarity: acc.contentClarity + f.contentClarity,
          engagementLevel: acc.engagementLevel + f.engagementLevel,
        }),
        { overallRating: 0, teachingQuality: 0, contentClarity: 0, engagementLevel: 0 }
      );
      return {
        total,
        averageRatings: {
          overallRating: round1(sum.overallRating / total),
          teachingQuality: round1(sum.teachingQuality / total),
          contentClarity: round1(sum.contentClarity / total),
          engagementLevel: round1(sum.engagementLevel / total),
        },
      };
    }),
  ]);

  const recommendations = generateRecommendations(moduleStats, dayAnalysis, feedbackSummary);

  // Overall attendance rate
  const ratedModules = moduleStats.filter((m) => m.attendanceRate !== null);
  const overallAttendanceRate = ratedModules.length > 0
    ? Math.round(avg(ratedModules.map((m) => m.attendanceRate)))
    : null;

  // Most popular lecture (highest attendance)
  const mostPopular = ratedModules.length > 0
    ? [...ratedModules].sort((a, b) => b.attendanceRate - a.attendanceRate)[0]
    : null;

  return {
    totalModules: modules.length,
    totalEntries: entries.length,
    overallAttendanceRate,
    mostPopular: mostPopular
      ? { moduleCode: mostPopular.moduleCode, moduleName: mostPopular.moduleName, rate: mostPopular.attendanceRate }
      : null,
    feedbackSummary,
    moduleStats,
    dayAnalysis,
    recommendations,
  };
};

// ─── Get Lecturer's Timetable Entries (for selecting a session) ───────────────

export const getLecturerSessions = async (lecturerId) => {
  const { entries } = await getLecturerEntries(lecturerId);
  return entries;
};
