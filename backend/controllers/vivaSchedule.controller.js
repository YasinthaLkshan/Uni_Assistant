import asyncHandler from "../utils/asyncHandler.js";
import {
  proposeViva,
  getLecturerVivas,
  getAllVivas,
  approveViva,
  rejectViva,
  deleteViva,
} from "../services/vivaSchedule.service.js";

// ─── Lecturer Controllers ───────────────────────────────────────────────────

export const proposeVivaController = asyncHandler(async (req, res) => {
  const viva = await proposeViva(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Viva proposed successfully",
    data: viva,
  });
});

export const getLecturerVivasController = asyncHandler(async (req, res) => {
  const vivas = await getLecturerVivas(req.user._id);

  res.status(200).json({
    success: true,
    message: "Vivas fetched",
    data: vivas,
  });
});

export const deleteVivaController = asyncHandler(async (req, res) => {
  await deleteViva(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Viva deleted",
  });
});

// ─── Admin Controllers ──────────────────────────────────────────────────────

export const getAllVivasController = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const vivas = await getAllVivas(filters);

  res.status(200).json({
    success: true,
    message: "All vivas fetched",
    data: vivas,
  });
});

export const approveVivaController = asyncHandler(async (req, res) => {
  const viva = await approveViva(req.params.id, req.user._id, req.body.remarks);

  res.status(200).json({
    success: true,
    message: "Viva approved",
    data: viva,
  });
});

export const rejectVivaController = asyncHandler(async (req, res) => {
  const viva = await rejectViva(req.params.id, req.user._id, req.body.remarks);

  res.status(200).json({
    success: true,
    message: "Viva rejected",
    data: viva,
  });
});
