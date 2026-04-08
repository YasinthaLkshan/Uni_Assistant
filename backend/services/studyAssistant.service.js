import AcademicEvent from "../models/AcademicEvent.js";
import Attendance from "../models/Attendance.js";
import Material from "../models/Material.js";
import MaterialView from "../models/MaterialView.js";
import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import TimetableEntry from "../models/TimetableEntry.js";
import AppError from "../utils/appError.js";
import { resolveStudentScope, scopeQuery } from "./studentAcademic.service.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const NOTIFICATION_COOLDOWN_MS = 180 * 60 * 1000; // 3 hours
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// ── Phase 1: Today's Lectures ──

export const getTodaysLectures = async (user) => {
  const scope = await resolveStudentScope(user);
  const todayName = DAY_NAMES[new Date().getDay()];

  const entries = await TimetableEntry.find({
    ...scopeQuery(scope),
    dayOfWeek: todayName,
  })
    .populate("module")
    .sort({ startTime: 1 })
    .lean();

  // Attach today's attendance status for each entry
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const attendanceRecords = await Attendance.find({
    user: user._id,
    timetableEntry: { $in: entries.map((e) => e._id) },
    date: startOfToday,
  }).lean();

  const attendanceMap = {};
  for (const record of attendanceRecords) {
    attendanceMap[record.timetableEntry.toString()] = record.status;
  }

  const items = entries.map((entry) => ({
    ...entry,
    attendanceStatus: attendanceMap[entry._id.toString()] || null,
  }));

  return { scope, dayOfWeek: todayName, items };
};

// ── Phase 1: Exam Countdown ──

export const getExamCountdown = async (user) => {
  const scope = await resolveStudentScope(user);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const exams = await AcademicEvent.find({
    ...scopeQuery(scope),
    eventType: { $in: ["Exam", "exam"] },
    eventDate: { $gte: startOfToday },
  })
    .populate("module")
    .sort({ eventDate: 1 })
    .lean();

  const items = exams.map((exam) => {
    const examDate = new Date(exam.eventDate);
    const daysRemaining = Math.ceil((examDate - startOfToday) / DAY_IN_MS);
    return { ...exam, daysRemaining };
  });

  return { scope, items };
};

// ── Phase 2: Mark Attendance ──

export const markAttendance = async (user, timetableEntryId, date, status) => {
  const scope = await resolveStudentScope(user);

  const entry = await TimetableEntry.findOne({
    _id: timetableEntryId,
    ...scopeQuery(scope),
  }).lean();

  if (!entry) {
    throw new AppError("Timetable entry not found or does not belong to your scope", 404);
  }

  const dateObj = new Date(date);
  const normalizedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  const record = await Attendance.findOneAndUpdate(
    {
      user: user._id,
      timetableEntry: timetableEntryId,
      date: normalizedDate,
    },
    {
      status: status || "Present",
      markedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  return record;
};

// ── Phase 2: Attendance Summary ──

export const getAttendanceSummary = async (user) => {
  const scope = await resolveStudentScope(user);

  const timetableEntries = await TimetableEntry.find(scopeQuery(scope))
    .select("_id moduleCode moduleName")
    .lean();

  const entryIds = timetableEntries.map((e) => e._id);

  // Group entries by moduleCode for lookup
  const moduleMap = {};
  for (const entry of timetableEntries) {
    if (!moduleMap[entry.moduleCode]) {
      moduleMap[entry.moduleCode] = {
        moduleCode: entry.moduleCode,
        moduleName: entry.moduleName,
        entryIds: [],
      };
    }
    moduleMap[entry.moduleCode].entryIds.push(entry._id);
  }

  // Get all attendance records for this student
  const records = await Attendance.find({
    user: user._id,
    timetableEntry: { $in: entryIds },
  }).lean();

  // Build per-module stats
  const modules = Object.values(moduleMap).map((mod) => {
    const entryIdSet = new Set(mod.entryIds.map((id) => id.toString()));
    const moduleRecords = records.filter((r) => entryIdSet.has(r.timetableEntry.toString()));

    const total = moduleRecords.length;
    const present = moduleRecords.filter((r) => r.status === "Present" || r.status === "Late").length;
    const absent = moduleRecords.filter((r) => r.status === "Absent").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      moduleCode: mod.moduleCode,
      moduleName: mod.moduleName,
      total,
      present,
      absent,
      percentage,
    };
  });

  // Overall stats
  const totalRecords = records.length;
  const totalPresent = records.filter((r) => r.status === "Present" || r.status === "Late").length;
  const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 100;

  return {
    scope,
    overall: { total: totalRecords, present: totalPresent, percentage: overallPercentage },
    modules,
  };
};

// ── Phase 2: Missed Lectures ──

export const getMissedLectures = async (user) => {
  const scope = await resolveStudentScope(user);

  const absentRecords = await Attendance.find({
    user: user._id,
    status: "Absent",
  })
    .populate({
      path: "timetableEntry",
      match: scopeQuery(scope),
    })
    .sort({ date: -1 })
    .lean();

  // Filter out records where timetableEntry didn't match scope (null after populate match)
  const filtered = absentRecords.filter((r) => r.timetableEntry !== null);

  // For each missed lecture, find related materials
  const items = await Promise.all(
    filtered.map(async (record) => {
      const entry = record.timetableEntry;
      const missedDate = new Date(record.date);

      // Find materials for this module uploaded around the missed date (within 7 days)
      const weekBefore = new Date(missedDate.getTime() - 7 * DAY_IN_MS);
      const weekAfter = new Date(missedDate.getTime() + 7 * DAY_IN_MS);

      const relatedMaterials = await Material.find({
        ...scopeQuery(scope),
        moduleCode: entry.moduleCode,
        createdAt: { $gte: weekBefore, $lte: weekAfter },
      })
        .select("title materialType filePath createdAt")
        .lean();

      return {
        _id: record._id,
        date: record.date,
        moduleCode: entry.moduleCode,
        moduleName: entry.moduleName,
        dayOfWeek: entry.dayOfWeek,
        activityType: entry.activityType,
        startTime: entry.startTime,
        endTime: entry.endTime,
        venue: entry.venue,
        lecturerNames: entry.lecturerNames,
        relatedMaterials,
      };
    })
  );

  return { scope, items };
};

// ── Phase 3: Pending Materials ──

export const getPendingMaterials = async (user) => {
  const scope = await resolveStudentScope(user);

  const allMaterials = await Material.find(scopeQuery(scope))
    .sort({ createdAt: -1 })
    .lean();

  const viewedRecords = await MaterialView.find({
    user: user._id,
    material: { $in: allMaterials.map((m) => m._id) },
  }).lean();

  const viewedSet = new Set(viewedRecords.map((v) => v.material.toString()));

  const pending = allMaterials.filter((m) => !viewedSet.has(m._id.toString()));
  const viewed = allMaterials.filter((m) => viewedSet.has(m._id.toString()));

  return {
    scope,
    pending,
    viewed,
    totalMaterials: allMaterials.length,
    pendingCount: pending.length,
    viewedCount: viewed.length,
  };
};

export const markMaterialViewed = async (user, materialId) => {
  const scope = await resolveStudentScope(user);

  const material = await Material.findOne({
    _id: materialId,
    ...scopeQuery(scope),
  }).lean();

  if (!material) {
    throw new AppError("Material not found or does not belong to your scope", 404);
  }

  const record = await MaterialView.findOneAndUpdate(
    { user: user._id, material: materialId },
    { viewedAt: new Date() },
    { upsert: true, new: true }
  );

  return record;
};

// ── Phase 4: Study Strategy Generator ──

export const generateStudyStrategy = async (user) => {
  const scope = await resolveStudentScope(user);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Gather all data in parallel
  const [attendanceData, pendingData, missedData, upcomingEvents, activeTasks] = await Promise.all([
    getAttendanceSummary(user),
    getPendingMaterials(user),
    getMissedLectures(user),
    AcademicEvent.find({
      ...scopeQuery(scope),
      eventDate: { $gte: startOfToday },
    }).sort({ eventDate: 1 }).lean(),
    Task.find({
      user: user._id,
      status: { $ne: "Completed" },
    }).sort({ deadline: 1 }).lean(),
  ]);

  // Build per-module attendance map
  const attendanceByModule = {};
  for (const mod of attendanceData.modules) {
    attendanceByModule[mod.moduleCode] = mod;
  }

  // Count missed lectures per module
  const missedByModule = {};
  for (const item of missedData.items) {
    missedByModule[item.moduleCode] = (missedByModule[item.moduleCode] || 0) + 1;
  }

  // Count pending materials per module
  const pendingByModule = {};
  for (const mat of pendingData.pending) {
    pendingByModule[mat.moduleCode] = (pendingByModule[mat.moduleCode] || 0) + 1;
  }

  // Get unique module codes from timetable
  const timetableEntries = await TimetableEntry.find(scopeQuery(scope))
    .select("moduleCode moduleName")
    .lean();

  const moduleSet = {};
  for (const entry of timetableEntries) {
    if (!moduleSet[entry.moduleCode]) {
      moduleSet[entry.moduleCode] = entry.moduleName;
    }
  }

  // Score each module
  const prioritizedModules = Object.entries(moduleSet).map(([moduleCode, moduleName]) => {
    let score = 0;
    const reasons = [];

    // Exam proximity scoring
    const moduleEvents = upcomingEvents.filter((e) => e.moduleCode === moduleCode);
    const moduleExams = moduleEvents.filter((e) =>
      ["Exam", "exam"].includes(e.eventType)
    );
    const moduleAssignments = moduleEvents.filter((e) =>
      ["Assignment", "Lab Test", "Presentation", "Viva"].includes(e.eventType)
    );

    for (const exam of moduleExams) {
      const daysLeft = Math.ceil((new Date(exam.eventDate) - startOfToday) / DAY_IN_MS);
      if (daysLeft <= 7) {
        score += 50;
        reasons.push(`Exam in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} — start intensive revision`);
      } else if (daysLeft <= 14) {
        score += 30;
        reasons.push(`Exam in ${daysLeft} days — begin structured review`);
      } else {
        score += 10;
        reasons.push(`Exam in ${daysLeft} days — plan ahead`);
      }
      if (exam.weightPercentage > 0) {
        score += Math.round(exam.weightPercentage * 0.5);
      }
    }

    for (const assignment of moduleAssignments) {
      const daysLeft = Math.ceil((new Date(assignment.eventDate) - startOfToday) / DAY_IN_MS);
      if (daysLeft <= 3) {
        score += 40;
        reasons.push(`${assignment.eventType} "${assignment.title}" due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} — urgent`);
      } else if (daysLeft <= 7) {
        score += 20;
        reasons.push(`${assignment.eventType} "${assignment.title}" due in ${daysLeft} days`);
      }
    }

    // Attendance scoring
    const attMod = attendanceByModule[moduleCode];
    if (attMod) {
      if (attMod.percentage < 60) {
        score += 25;
        reasons.push(`Attendance critically low at ${attMod.percentage}% — attend all remaining classes`);
      } else if (attMod.percentage < 80) {
        score += 10;
        reasons.push(`Attendance at ${attMod.percentage}% — improvement needed`);
      }
    }

    // Pending materials scoring
    const pendingCount = pendingByModule[moduleCode] || 0;
    if (pendingCount > 0) {
      score += pendingCount * 5;
      reasons.push(`${pendingCount} unreviewed material${pendingCount !== 1 ? "s" : ""} — review them`);
    }

    // Missed lectures scoring
    const missedCount = missedByModule[moduleCode] || 0;
    if (missedCount > 0) {
      score += missedCount * 8;
      reasons.push(`${missedCount} missed lecture${missedCount !== 1 ? "s" : ""} — catch up on content`);
    }

    return {
      moduleCode,
      moduleName,
      score,
      reasons,
      attendance: attMod?.percentage ?? null,
      pendingMaterials: pendingCount,
      missedLectures: missedCount,
      upcomingExams: moduleExams.length,
      upcomingAssignments: moduleAssignments.length,
    };
  });

  // Sort by score descending
  prioritizedModules.sort((a, b) => b.score - a.score);

  // Generate top action items
  const actionItems = [];
  for (const mod of prioritizedModules) {
    for (const reason of mod.reasons) {
      actionItems.push({
        moduleCode: mod.moduleCode,
        moduleName: mod.moduleName,
        action: reason,
        priority: mod.score >= 50 ? "High" : mod.score >= 20 ? "Medium" : "Low",
      });
    }
  }
  actionItems.sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });

  // Overall health score (0-100, higher is better)
  const totalScore = prioritizedModules.reduce((sum, m) => sum + m.score, 0);
  const maxPossibleScore = prioritizedModules.length * 100;
  const healthScore = maxPossibleScore > 0
    ? Math.max(0, Math.round(100 - (totalScore / maxPossibleScore) * 100))
    : 100;

  return {
    scope,
    prioritizedModules,
    actionItems: actionItems.slice(0, 15),
    healthScore,
    activeTasks: activeTasks.length,
    generatedAt: new Date().toISOString(),
  };
};

// ── Phase 5: Notifications ──

const createIfNotRecent = async (userId, message, type) => {
  const windowStart = new Date(Date.now() - NOTIFICATION_COOLDOWN_MS);
  const existing = await Notification.findOne({
    user: userId,
    message,
    createdAt: { $gte: windowStart },
  }).lean();
  if (existing) return null;
  return Notification.create({ user: userId, message, type });
};

export const generateStudyNotifications = async (user) => {
  const scope = await resolveStudentScope(user);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifications = [];

  // 1. Low attendance warnings
  const attendanceData = await getAttendanceSummary(user);
  for (const mod of attendanceData.modules) {
    if (mod.total > 0 && mod.percentage < 60) {
      notifications.push({
        message: `Critical: ${mod.moduleName} (${mod.moduleCode}) attendance is at ${mod.percentage}%. You must attend all remaining classes.`,
        type: "attendance",
      });
    } else if (mod.total > 0 && mod.percentage < 80) {
      notifications.push({
        message: `Warning: ${mod.moduleName} (${mod.moduleCode}) attendance is at ${mod.percentage}%. Try to improve your attendance.`,
        type: "attendance",
      });
    }
  }

  // 2. Upcoming exam alerts (3 days and 7 days)
  const upcomingExams = await AcademicEvent.find({
    ...scopeQuery(scope),
    eventType: { $in: ["Exam", "exam"] },
    eventDate: { $gte: startOfToday },
  }).lean();

  for (const exam of upcomingExams) {
    const daysLeft = Math.ceil((new Date(exam.eventDate) - startOfToday) / DAY_IN_MS);
    if (daysLeft <= 3) {
      notifications.push({
        message: `Urgent: ${exam.title} (${exam.moduleName}) is in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}! Start intensive revision now.`,
        type: "deadline",
      });
    } else if (daysLeft <= 7) {
      notifications.push({
        message: `Reminder: ${exam.title} (${exam.moduleName}) is in ${daysLeft} days. Begin your review.`,
        type: "deadline",
      });
    }
  }

  // 3. Assignment/Lab Test deadline reminders
  const upcomingAssignments = await AcademicEvent.find({
    ...scopeQuery(scope),
    eventType: { $in: ["Assignment", "Lab Test", "Presentation", "Viva"] },
    eventDate: { $gte: startOfToday },
  }).lean();

  for (const assignment of upcomingAssignments) {
    const daysLeft = Math.ceil((new Date(assignment.eventDate) - startOfToday) / DAY_IN_MS);
    if (daysLeft <= 3) {
      notifications.push({
        message: `Due soon: ${assignment.title} (${assignment.moduleName}) — ${assignment.eventType} due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
        type: "deadline",
      });
    }
  }

  // 4. New materials uploaded (unread count > 5)
  const pendingData = await getPendingMaterials(user);
  if (pendingData.pendingCount > 5) {
    notifications.push({
      message: `You have ${pendingData.pendingCount} unread lecture materials. Review them to stay on track.`,
      type: "general",
    });
  }

  // Create all notifications (with cooldown dedup)
  const results = await Promise.all(
    notifications.map((n) => createIfNotRecent(user._id, n.message, n.type))
  );

  return results.filter(Boolean).length;
};

export const getStudyNotifications = async (user) => {
  const items = await Notification.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const unreadCount = await Notification.countDocuments({ user: user._id, isRead: false });

  return { items, unreadCount };
};

export const markNotificationsRead = async (user) => {
  await Notification.updateMany(
    { user: user._id, isRead: false },
    { isRead: true }
  );
};

// ── Aggregated Dashboard ──

export const getStudyAssistantDashboard = async (user) => {
  const [todaysLectures, examCountdown, attendanceSummary, missedLecturesData, pendingMaterials, studyStrategy] =
    await Promise.all([
      getTodaysLectures(user),
      getExamCountdown(user),
      getAttendanceSummary(user),
      getMissedLectures(user),
      getPendingMaterials(user),
      generateStudyStrategy(user),
    ]);

  // Generate notifications in background (fire and forget)
  generateStudyNotifications(user).catch(() => {});

  // Fetch notification count
  const notificationData = await getStudyNotifications(user);

  return {
    todaysLectures,
    examCountdown,
    attendanceSummary,
    missedLectures: missedLecturesData,
    pendingMaterials,
    studyStrategy,
    notifications: notificationData,
  };
};
