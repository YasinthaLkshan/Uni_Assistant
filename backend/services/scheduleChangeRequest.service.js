import mongoose from "mongoose";

import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import LectureSchedule, { TIME_SLOTS } from "../models/LectureSchedule.js";
import { isHoliday } from "./holiday.service.js";
import { checkConflicts } from "./lectureSchedule.service.js";
import AppError from "../utils/appError.js";

const getSlotTimes = (slotNumber) => {
  const found = TIME_SLOTS.find((s) => s.slot === slotNumber);
  if (!found) throw new AppError("Invalid slot number", 400);
  return found;
};

const getDayOfWeek = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(date).getDay()];
};

// ─── Lecturer Operations ────────────────────────────────────────────────────

/**
 * File a new change request.
 */
export const fileChangeRequest = async (lecturerId, payload) => {
  const { sessionId, proposedDate, proposedSlot, reason } = payload;

  if (!sessionId || !proposedDate || !proposedSlot || !reason) {
    throw new AppError("sessionId, proposedDate, proposedSlot, and reason are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new AppError("Invalid session id", 400);
  }

  const session = await LectureSchedule.findOne({
    _id: sessionId,
    lecturer: lecturerId,
    status: "submitted",
  });

  if (!session) {
    throw new AppError("Session not found or not yet submitted", 404);
  }

  // Check for existing pending request on same session
  const existingRequest = await ScheduleChangeRequest.findOne({
    session: sessionId,
    status: "pending",
  });

  if (existingRequest) {
    throw new AppError("A pending change request already exists for this session", 409);
  }

  const created = await ScheduleChangeRequest.create({
    lecturer: lecturerId,
    session: sessionId,
    module: session.module,
    group: session.group,
    currentDate: session.date,
    currentSlot: session.slot,
    currentType: session.type,
    proposedDate: new Date(proposedDate),
    proposedSlot: Number(proposedSlot),
    reason: String(reason).trim(),
  });

  return created;
};

/**
 * Get all change requests for a lecturer.
 */
export const getLecturerRequests = async (lecturerId) => {
  const requests = await ScheduleChangeRequest.find({ lecturer: lecturerId })
    .populate("module", "moduleCode moduleName")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });

  return requests;
};

// ─── Admin Operations ───────────────────────────────────────────────────────

/**
 * Get all change requests (admin view).
 */
export const getAllRequests = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;

  const requests = await ScheduleChangeRequest.find(query)
    .populate("lecturer", "name email")
    .populate("module", "moduleCode moduleName")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * Approve a change request — perform the actual reschedule.
 */
export const approveRequest = async (requestId, adminId, remarks = "") => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new AppError("Invalid request id", 400);
  }

  const request = await ScheduleChangeRequest.findById(requestId);
  if (!request) throw new AppError("Change request not found", 404);

  if (request.status !== "pending") {
    throw new AppError(`Request already ${request.status}`, 400);
  }

  const session = await LectureSchedule.findById(request.session);
  if (!session) throw new AppError("Original session no longer exists", 404);

  // Validate proposed date
  const proposedDay = getDayOfWeek(request.proposedDate);

  const holiday = await isHoliday(request.proposedDate);
  if (holiday) {
    throw new AppError(`Proposed date is a holiday — ${holiday.name}`, 400);
  }

  // Check conflicts for the new date/slot
  const conflicts = await checkConflicts(
    session.lecturer,
    request.proposedDate,
    request.proposedSlot,
    session.programme,
    session.academicYear,
    session.group,
    session._id // exclude the session being moved
  );

  if (conflicts.length > 0) {
    throw new AppError(
      `Cannot reschedule — ${conflicts.map((c) => c.message).join("; ")}`,
      409
    );
  }

  // Perform the reschedule
  const slotTimes = getSlotTimes(request.proposedSlot);

  session.date = request.proposedDate;
  session.dayOfWeek = proposedDay;
  session.slot = request.proposedSlot;
  session.startTime = slotTimes.startTime;
  session.endTime = slotTimes.endTime;
  await session.save();

  // Update the request
  request.status = "approved";
  request.adminRemarks = String(remarks).trim();
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  await request.save();

  return request;
};

/**
 * Reject a change request.
 */
export const rejectRequest = async (requestId, adminId, remarks = "") => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new AppError("Invalid request id", 400);
  }

  const request = await ScheduleChangeRequest.findById(requestId);
  if (!request) throw new AppError("Change request not found", 404);

  if (request.status !== "pending") {
    throw new AppError(`Request already ${request.status}`, 400);
  }

  request.status = "rejected";
  request.adminRemarks = String(remarks).trim();
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  await request.save();

  return request;
};
