import asyncHandler from "../utils/asyncHandler.js";
import {
  submitFeedback,
  getMyFeedback,
  getModulesForFeedback,
  getLecturerFeedbackSummary,
  getLecturerModuleFeedback,
} from "../services/feedback.service.js";

// ─── Student Controllers ─────────────────────────────────────────────────────

export const submitFeedbackController = asyncHandler(async (req, res) => {
  const feedback = await submitFeedback(req.user._id, req.body);
  res.status(201).json({ success: true, message: "Feedback submitted. Thank you!", data: feedback });
});

export const getMyFeedbackController = asyncHandler(async (req, res) => {
  const feedbacks = await getMyFeedback(req.user._id);
  res.status(200).json({ success: true, data: feedbacks });
});

export const getModulesForFeedbackController = asyncHandler(async (req, res) => {
  const modules = await getModulesForFeedback(req.user);
  res.status(200).json({ success: true, data: modules });
});

// ─── Lecturer Controllers ─────────────────────────────────────────────────────

export const getLecturerFeedbackSummaryController = asyncHandler(async (req, res) => {
  const summary = await getLecturerFeedbackSummary(req.user._id);
  res.status(200).json({ success: true, data: summary });
});

export const getLecturerModuleFeedbackController = asyncHandler(async (req, res) => {
  const feedbacks = await getLecturerModuleFeedback(req.user._id, req.params.moduleCode);
  res.status(200).json({ success: true, data: feedbacks });
});
