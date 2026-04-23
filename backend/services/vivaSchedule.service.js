import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";
import VivaSchedule, { VIVA_TYPES } from "../models/VivaSchedule.js";
import LectureSchedule, { TIME_SLOTS } from "../models/LectureSchedule.js";
import Module from "../models/Module.js";
import { isHoliday } from "./holiday.service.js";
import AppError from "../utils/appError.js";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getSlotTimes = (slotNumber) => {
  const found = TIME_SLOTS.find((s) => s.slot === slotNumber);
  if (!found) throw new AppError("Invalid slot number", 400);
  return found;
};

const getDayOfWeek = (date) => DAYS_OF_WEEK[new Date(date).getDay()];

/**
 * Check if a proposed viva clashes with existing lecture sessions for the batch.
 */
const checkVivaClashes = async (lecturerId, date, slot, programme, academicYear, group, excludeId = null) => {
  const clashes = [];
  const dateObj = new Date(date);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);
  const excludeFilter = excludeId ? { _id: { $ne: excludeId } } : {};

  // Check lecturer double-booking (lectures)
  const lecturerLectureClash = await LectureSchedule.findOne({
    lecturer: lecturerId,
    date: { $gte: startOfDay, $lte: endOfDay },
    slot,
    ...excludeFilter,
  }).populate("module", "moduleCode");

  if (lecturerLectureClash) {
    clashes.push(`Lecturer has a lecture (${lecturerLectureClash.module?.moduleCode}) in this slot`);
  }

  // Check batch lecture clash
  if (programme) {
    const batchLectureClash = await LectureSchedule.findOne({
      programme,
      academicYear,
      group,
      date: { $gte: startOfDay, $lte: endOfDay },
      slot,
    }).populate("module", "moduleCode");

    if (batchLectureClash) {
      clashes.push(`Group ${group} has a lecture (${batchLectureClash.module?.moduleCode}) in this slot`);
    }
  }

  // Check lecturer viva clash
  const lecturerVivaClash = await VivaSchedule.findOne({
    lecturer: lecturerId,
    date: { $gte: startOfDay, $lte: endOfDay },
    slot,
    status: { $ne: "rejected" },
    ...excludeFilter,
  });

  if (lecturerVivaClash) {
    clashes.push("Lecturer already has a viva in this slot");
  }

  // Check batch viva clash
  if (programme) {
    const batchVivaClash = await VivaSchedule.findOne({
      programme,
      academicYear,
      group,
      date: { $gte: startOfDay, $lte: endOfDay },
      slot,
      status: { $ne: "rejected" },
      ...excludeFilter,
    });

    if (batchVivaClash) {
      clashes.push(`Group ${group} already has a viva in this slot`);
    }
  }

  return clashes;
};

/**
 * Check that on a final viva day, no lectures are scheduled for the batch.
 */
const checkFinalVivaDay = async (date, programme, academicYear, group) => {
  const dateObj = new Date(date);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  if (!programme) return [];

  const lecturesOnDay = await LectureSchedule.find({
    programme,
    academicYear,
    group,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).populate("module", "moduleCode");

  if (lecturesOnDay.length > 0) {
    const codes = lecturesOnDay.map((l) => l.module?.moduleCode || "?").join(", ");
    return [`Final viva day cannot have lectures for the batch — found: ${codes}`];
  }

  return [];
};

/**
 * Propose a viva session.
 */
export const proposeViva = async (lecturerId, payload) => {
  const { moduleId, group, assignmentTitle, vivaType, date, slot } = payload;

  if (!moduleId || !group || !assignmentTitle || !vivaType || !date || !slot) {
    throw new AppError("moduleId, group, assignmentTitle, vivaType, date, and slot are required", 400);
  }

  if (!VIVA_TYPES.includes(vivaType)) {
    throw new AppError(`vivaType must be one of: ${VIVA_TYPES.join(", ")}`, 400);
  }

  const mod = await Module.findById(moduleId).populate("programme");
  if (!mod) throw new AppError("Module not found", 404);

  const dayOfWeek = getDayOfWeek(date);

  const holiday = await isHoliday(date);
  if (holiday) {
    throw new AppError(`Date is a holiday — ${holiday.name}`, 400);
  }

  const slotTimes = getSlotTimes(Number(slot));
  const programme = mod.programme?._id || mod.programme || null;

  // Check clashes
  const clashes = await checkVivaClashes(
    lecturerId, date, Number(slot), programme, mod.academicYear, Number(group)
  );

  if (clashes.length > 0) {
    throw new AppError(clashes.join("; "), 409);
  }

  // For final vivas, ensure no lectures on that day for the batch
  if (vivaType === "final") {
    const finalClashes = await checkFinalVivaDay(date, programme, mod.academicYear, Number(group));
    if (finalClashes.length > 0) {
      throw new AppError(finalClashes.join("; "), 409);
    }
  }

  const created = await VivaSchedule.create({
    module: moduleId,
    lecturer: lecturerId,
    programme,
    group: Number(group),
    academicYear: mod.academicYear,
    semester: mod.semester,
    assignmentTitle: String(assignmentTitle).trim(),
    vivaType,
    date: new Date(date),
    dayOfWeek,
    slot: Number(slot),
    startTime: slotTimes.startTime,
    endTime: slotTimes.endTime,
    faculty: ACADEMIC_FACULTY,
  });

  return created;
};

/**
 * Get all vivas for a lecturer.
 */
export const getLecturerVivas = async (lecturerId) => {
  const vivas = await VivaSchedule.find({ lecturer: lecturerId })
    .populate("module", "moduleCode moduleName")
    .populate("programme", "programmeCode programmeName")
    .sort({ date: 1, slot: 1 });

  return vivas;
};

/**
 * Get all vivas (admin view).
 */
export const getAllVivas = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;

  const vivas = await VivaSchedule.find(query)
    .populate("module", "moduleCode moduleName")
    .populate("lecturer", "name email")
    .populate("programme", "programmeCode programmeName")
    .sort({ createdAt: -1 });

  return vivas;
};

/**
 * Admin approves a viva.
 */
export const approveViva = async (vivaId, adminId, remarks = "") => {
  if (!mongoose.Types.ObjectId.isValid(vivaId)) {
    throw new AppError("Invalid viva id", 400);
  }

  const viva = await VivaSchedule.findById(vivaId);
  if (!viva) throw new AppError("Viva not found", 404);
  if (viva.status !== "proposed") throw new AppError(`Viva already ${viva.status}`, 400);

  viva.status = "approved";
  viva.adminRemarks = String(remarks).trim();
  viva.reviewedBy = adminId;
  viva.reviewedAt = new Date();
  await viva.save();

  return viva;
};

/**
 * Admin rejects a viva.
 */
export const rejectViva = async (vivaId, adminId, remarks = "") => {
  if (!mongoose.Types.ObjectId.isValid(vivaId)) {
    throw new AppError("Invalid viva id", 400);
  }

  const viva = await VivaSchedule.findById(vivaId);
  if (!viva) throw new AppError("Viva not found", 404);
  if (viva.status !== "proposed") throw new AppError(`Viva already ${viva.status}`, 400);

  viva.status = "rejected";
  viva.adminRemarks = String(remarks).trim();
  viva.reviewedBy = adminId;
  viva.reviewedAt = new Date();
  await viva.save();

  return viva;
};

/**
 * Delete a proposed viva (lecturer only, before approval).
 */
export const deleteViva = async (lecturerId, vivaId) => {
  if (!mongoose.Types.ObjectId.isValid(vivaId)) {
    throw new AppError("Invalid viva id", 400);
  }

  const viva = await VivaSchedule.findOne({ _id: vivaId, lecturer: lecturerId });
  if (!viva) throw new AppError("Viva not found", 404);
  if (viva.status === "approved") throw new AppError("Cannot delete an approved viva", 400);

  await VivaSchedule.findByIdAndDelete(vivaId);
  return viva;
};
