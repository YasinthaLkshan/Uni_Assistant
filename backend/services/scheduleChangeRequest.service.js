import mongoose from "mongoose";

import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import TimetableEntry from "../models/TimetableEntry.js";
import AppError from "../utils/appError.js";

// ─── Lecturer Operations ────────────────────────────────────────────────────

/**
 * File a new change request for a timetable entry on a specific date.
 */
export const fileChangeRequest = async (lecturerId, payload) => {
  const { timetableEntryId, proposedDate, proposedTime, reason } = payload;

  if (!timetableEntryId || !proposedDate || !proposedTime || !reason) {
    throw new AppError("timetableEntryId, proposedDate, proposedTime, and reason are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(timetableEntryId)) {
    throw new AppError("Invalid timetable entry id", 400);
  }

  const entry = await TimetableEntry.findById(timetableEntryId);
  if (!entry) {
    throw new AppError("Timetable entry not found", 404);
  }

  // Check for existing pending request on same entry for same date
  const existingRequest = await ScheduleChangeRequest.findOne({
    timetableEntry: timetableEntryId,
    proposedDate: new Date(proposedDate),
    status: "pending",
  });

  if (existingRequest) {
    throw new AppError("A pending change request already exists for this entry", 409);
  }

  const created = await ScheduleChangeRequest.create({
    lecturer: lecturerId,
    timetableEntry: timetableEntryId,
    module: entry.module,
    moduleCode: entry.moduleCode,
    group: entry.groupNumber,
    currentDay: entry.dayOfWeek,
    currentTime: `${entry.startTime} - ${entry.endTime}`,
    proposedDate: new Date(proposedDate),
    proposedTime: String(proposedTime).trim(),
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
 * Approve a change request.
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
