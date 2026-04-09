import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";
import LectureSchedule, { TIME_SLOTS, DAYS_OF_WEEK } from "../models/LectureSchedule.js";
import Module from "../models/Module.js";
import { isHoliday } from "./holiday.service.js";
import AppError from "../utils/appError.js";

const HOURS_PER_SESSION = 2;
const SEMESTER_WEEKS = 24;

const getSlotTimes = (slotNumber) => {
  const found = TIME_SLOTS.find((s) => s.slot === slotNumber);
  if (!found) throw new AppError("Invalid slot number, must be 1, 2, or 3", 400);
  return found;
};

const getDayOfWeek = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(date).getDay()];
};

const formatDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Calculate required sessions for a module.
 * Theory sessions = (lectureHoursPerWeek / 2) * SEMESTER_WEEKS
 * Lab sessions = (labHoursPerWeek / 2) * SEMESTER_WEEKS
 */
export const calculateRequiredSessions = (mod) => {
  const theoryPerWeek = Math.ceil((mod.lectureHoursPerWeek || 0) / HOURS_PER_SESSION);
  const labPerWeek = Math.ceil((mod.labHoursPerWeek || 0) / HOURS_PER_SESSION);

  return {
    theoryTotal: theoryPerWeek * SEMESTER_WEEKS,
    labTotal: labPerWeek * SEMESTER_WEEKS,
    theoryPerWeek,
    labPerWeek,
    totalPerWeek: theoryPerWeek + labPerWeek,
  };
};

/**
 * Get schedule summary for a lecturer's module+group — how many sessions scheduled vs required.
 */
export const getScheduleSummary = async (lecturerId, moduleId, group) => {
  const mod = await Module.findById(moduleId);
  if (!mod) throw new AppError("Module not found", 404);

  const required = calculateRequiredSessions(mod);

  const scheduled = await LectureSchedule.aggregate([
    {
      $match: {
        module: new mongoose.Types.ObjectId(moduleId),
        lecturer: new mongoose.Types.ObjectId(lecturerId),
        group: Number(group),
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  const theoryScheduled = scheduled.find((s) => s._id === "theory")?.count || 0;
  const labScheduled = scheduled.find((s) => s._id === "lab")?.count || 0;

  return {
    required,
    scheduled: {
      theory: theoryScheduled,
      lab: labScheduled,
    },
    remaining: {
      theory: Math.max(0, required.theoryTotal - theoryScheduled),
      lab: Math.max(0, required.labTotal - labScheduled),
    },
    isComplete: theoryScheduled >= required.theoryTotal && labScheduled >= required.labTotal,
  };
};

/**
 * Check for conflicts before scheduling a session.
 * 1. Lecturer double-booking: same lecturer, same date+slot
 * 2. Batch clash: same programme+year+group, same date+slot
 */
export const checkConflicts = async (lecturerId, date, slot, programme, academicYear, group, excludeId = null) => {
  const conflicts = [];
  const dateObj = new Date(date);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const excludeFilter = excludeId ? { _id: { $ne: excludeId } } : {};

  // Check lecturer double-booking
  const lecturerConflict = await LectureSchedule.findOne({
    lecturer: lecturerId,
    date: { $gte: startOfDay, $lte: endOfDay },
    slot,
    ...excludeFilter,
  }).populate("module", "moduleCode moduleName");

  if (lecturerConflict) {
    conflicts.push({
      type: "lecturer",
      message: `You already have ${lecturerConflict.module?.moduleCode || "a session"} scheduled in this slot`,
      existing: lecturerConflict,
    });
  }

  // Check batch clash (same programme+year+group at same date+slot)
  if (programme) {
    const batchConflict = await LectureSchedule.findOne({
      programme,
      academicYear,
      group,
      date: { $gte: startOfDay, $lte: endOfDay },
      slot,
      ...excludeFilter,
    }).populate("module", "moduleCode moduleName");

    if (batchConflict) {
      conflicts.push({
        type: "batch",
        message: `Group ${group} already has ${batchConflict.module?.moduleCode || "a session"} in this slot`,
        existing: batchConflict,
      });
    }
  }

  return conflicts;
};

/**
 * Add sessions to the schedule (bulk). Does conflict checking for each.
 */
export const addSessions = async (lecturerId, moduleId, group, sessions) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    throw new AppError("At least one session is required", 400);
  }

  const mod = await Module.findById(moduleId).populate("programme");
  if (!mod) throw new AppError("Module not found", 404);

  const created = [];
  const errors = [];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const { date, slot, type } = session;

    if (!date || !slot || !type) {
      errors.push({ index: i, message: "date, slot, and type are required" });
      continue;
    }

    if (!["theory", "lab"].includes(type)) {
      errors.push({ index: i, message: "type must be 'theory' or 'lab'" });
      continue;
    }

    const slotTimes = getSlotTimes(Number(slot));
    const dayOfWeek = getDayOfWeek(date);

    // Check if date is a holiday
    const holiday = await isHoliday(date);
    if (holiday) {
      errors.push({ index: i, message: `${formatDateStr(date)} is a holiday — ${holiday.name}` });
      continue;
    }

    // Check conflicts
    const conflicts = await checkConflicts(
      lecturerId,
      date,
      Number(slot),
      mod.programme?._id || mod.programme,
      mod.academicYear,
      Number(group)
    );

    if (conflicts.length > 0) {
      errors.push({
        index: i,
        message: conflicts.map((c) => c.message).join("; "),
        conflicts,
      });
      continue;
    }

    try {
      const entry = await LectureSchedule.create({
        module: moduleId,
        lecturer: lecturerId,
        programme: mod.programme?._id || mod.programme || null,
        group: Number(group),
        academicYear: mod.academicYear,
        semester: mod.semester,
        date: new Date(date),
        dayOfWeek,
        slot: Number(slot),
        startTime: slotTimes.startTime,
        endTime: slotTimes.endTime,
        type,
        status: "draft",
        faculty: ACADEMIC_FACULTY,
      });

      created.push(entry);
    } catch (err) {
      if (err.code === 11000) {
        errors.push({ index: i, message: "Duplicate session — this slot is already taken" });
      } else {
        errors.push({ index: i, message: err.message });
      }
    }
  }

  return { created, errors };
};

/**
 * Remove a draft session.
 */
export const removeSession = async (lecturerId, sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new AppError("Invalid session id", 400);
  }

  const session = await LectureSchedule.findOne({
    _id: sessionId,
    lecturer: lecturerId,
  });

  if (!session) throw new AppError("Session not found", 404);

  if (session.status === "submitted") {
    throw new AppError("Cannot remove a submitted session — file a change request instead", 400);
  }

  await LectureSchedule.findByIdAndDelete(sessionId);
  return session;
};

/**
 * Get all sessions for a lecturer's module+group.
 */
export const getModuleSchedule = async (lecturerId, moduleId, group) => {
  const sessions = await LectureSchedule.find({
    module: moduleId,
    lecturer: lecturerId,
    group: Number(group),
  })
    .populate("module", "moduleCode moduleName")
    .sort({ date: 1, slot: 1 });

  return sessions;
};

/**
 * Get all sessions for a lecturer across all modules.
 */
export const getLecturerFullSchedule = async (lecturerId) => {
  const sessions = await LectureSchedule.find({ lecturer: lecturerId })
    .populate("module", "moduleCode moduleName lectureHoursPerWeek labHoursPerWeek")
    .populate("programme", "programmeCode programmeName")
    .sort({ date: 1, slot: 1 });

  return sessions;
};

/**
 * Submit all draft sessions for a module+group. Validates that all required hours are filled.
 */
export const submitSchedule = async (lecturerId, moduleId, group) => {
  const summary = await getScheduleSummary(lecturerId, moduleId, group);

  if (!summary.isComplete) {
    const parts = [];
    if (summary.remaining.theory > 0) {
      parts.push(`${summary.remaining.theory} theory session(s)`);
    }
    if (summary.remaining.lab > 0) {
      parts.push(`${summary.remaining.lab} lab session(s)`);
    }
    throw new AppError(`Schedule incomplete — still need ${parts.join(" and ")}`, 400);
  }

  const result = await LectureSchedule.updateMany(
    {
      module: moduleId,
      lecturer: lecturerId,
      group: Number(group),
      status: "draft",
    },
    { $set: { status: "submitted" } }
  );

  return { submitted: result.modifiedCount };
};
