import asyncHandler from "../utils/asyncHandler.js";
import {
  fileChangeRequest,
  getLecturerRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "../services/scheduleChangeRequest.service.js";

// ─── Lecturer Controllers ───────────────────────────────────────────────────

export const fileChangeRequestController = asyncHandler(async (req, res) => {
  const request = await fileChangeRequest(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Change request filed successfully",
    data: request,
  });
});

export const getLecturerRequestsController = asyncHandler(async (req, res) => {
  const requests = await getLecturerRequests(req.user._id);

  res.status(200).json({
    success: true,
    message: "Change requests fetched",
    data: requests,
  });
});

// ─── Admin Controllers ──────────────────────────────────────────────────────

export const getAllRequestsController = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const requests = await getAllRequests(filters);

  res.status(200).json({
    success: true,
    message: "All change requests fetched",
    data: requests,
  });
});

export const approveRequestController = asyncHandler(async (req, res) => {
  const request = await approveRequest(req.params.id, req.user._id, req.body.remarks);

  res.status(200).json({
    success: true,
    message: "Change request approved and schedule updated",
    data: request,
  });
});

export const rejectRequestController = asyncHandler(async (req, res) => {
  const request = await rejectRequest(req.params.id, req.user._id, req.body.remarks);

  res.status(200).json({
    success: true,
    message: "Change request rejected",
    data: request,
  });
});
