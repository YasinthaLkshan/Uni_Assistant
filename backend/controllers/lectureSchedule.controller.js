import asyncHandler from "../utils/asyncHandler.js";
import {
  addSessions,
  getModuleSchedule,
  getScheduleSummary,
  getLecturerFullSchedule,
  removeSession,
  submitSchedule,
} from "../services/lectureSchedule.service.js";

export const getScheduleSummaryController = asyncHandler(async (req, res) => {
  const { moduleId, group } = req.params;
  const summary = await getScheduleSummary(req.user._id, moduleId, group);

  res.status(200).json({
    success: true,
    message: "Schedule summary fetched",
    data: summary,
  });
});

export const getModuleScheduleController = asyncHandler(async (req, res) => {
  const { moduleId, group } = req.params;
  const sessions = await getModuleSchedule(req.user._id, moduleId, group);

  res.status(200).json({
    success: true,
    message: "Module schedule fetched",
    data: sessions,
  });
});

export const getFullScheduleController = asyncHandler(async (req, res) => {
  const sessions = await getLecturerFullSchedule(req.user._id);

  res.status(200).json({
    success: true,
    message: "Full schedule fetched",
    data: sessions,
  });
});

export const addSessionsController = asyncHandler(async (req, res) => {
  const { moduleId, group } = req.params;
  const { sessions } = req.body;

  const result = await addSessions(req.user._id, moduleId, group, sessions);

  const status = result.errors.length > 0 ? 207 : 201;

  res.status(status).json({
    success: result.errors.length === 0,
    message: result.errors.length > 0
      ? `${result.created.length} session(s) added, ${result.errors.length} failed`
      : `${result.created.length} session(s) added successfully`,
    data: result,
  });
});

export const removeSessionController = asyncHandler(async (req, res) => {
  await removeSession(req.user._id, req.params.sessionId);

  res.status(200).json({
    success: true,
    message: "Session removed",
  });
});

export const submitScheduleController = asyncHandler(async (req, res) => {
  const { moduleId, group } = req.params;
  const result = await submitSchedule(req.user._id, moduleId, group);

  res.status(200).json({
    success: true,
    message: `Schedule submitted — ${result.submitted} session(s) confirmed`,
    data: result,
  });
});
