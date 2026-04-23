import asyncHandler from "../utils/asyncHandler.js";
import {
  getTodaysLectures,
  getExamCountdown,
  markAttendance,
  getAttendanceSummary,
  getMissedLectures,
  getPendingMaterials,
  markMaterialViewed,
  generateStudyStrategy,
  getStudyAssistantDashboard,
  getStudyNotifications,
  markNotificationsRead,
} from "../services/studyAssistant.service.js";

export const getTodaysLecturesController = asyncHandler(async (req, res) => {
  const data = await getTodaysLectures(req.user);
  res.status(200).json({ success: true, message: "Today's lectures retrieved", data });
});

export const getExamCountdownController = asyncHandler(async (req, res) => {
  const data = await getExamCountdown(req.user);
  res.status(200).json({ success: true, message: "Exam countdown retrieved", data });
});

export const markAttendanceController = asyncHandler(async (req, res) => {
  const { timetableEntryId, date, status } = req.body;
  if (!timetableEntryId || !date) {
    return res.status(400).json({ success: false, message: "timetableEntryId and date are required" });
  }
  const record = await markAttendance(req.user, timetableEntryId, date, status);
  res.status(200).json({ success: true, message: "Attendance marked successfully", data: record });
});

export const getAttendanceSummaryController = asyncHandler(async (req, res) => {
  const data = await getAttendanceSummary(req.user);
  res.status(200).json({ success: true, message: "Attendance summary retrieved", data });
});

export const getMissedLecturesController = asyncHandler(async (req, res) => {
  const data = await getMissedLectures(req.user);
  res.status(200).json({ success: true, message: "Missed lectures retrieved", data });
});

export const getPendingMaterialsController = asyncHandler(async (req, res) => {
  const data = await getPendingMaterials(req.user);
  res.status(200).json({ success: true, message: "Pending materials retrieved", data });
});

export const markMaterialViewedController = asyncHandler(async (req, res) => {
  const { materialId } = req.body;
  if (!materialId) {
    return res.status(400).json({ success: false, message: "materialId is required" });
  }
  const record = await markMaterialViewed(req.user, materialId);
  res.status(200).json({ success: true, message: "Material marked as viewed", data: record });
});

export const getStudyStrategyController = asyncHandler(async (req, res) => {
  const data = await generateStudyStrategy(req.user);
  res.status(200).json({ success: true, message: "Study strategy generated", data });
});

export const getStudyAssistantDashboardController = asyncHandler(async (req, res) => {
  const data = await getStudyAssistantDashboard(req.user);
  res.status(200).json({ success: true, message: "Study assistant dashboard retrieved", data });
});

export const getStudyNotificationsController = asyncHandler(async (req, res) => {
  const data = await getStudyNotifications(req.user);
  res.status(200).json({ success: true, message: "Notifications retrieved", data });
});

export const markNotificationsReadController = asyncHandler(async (req, res) => {
  await markNotificationsRead(req.user);
  res.status(200).json({ success: true, message: "Notifications marked as read" });
});
