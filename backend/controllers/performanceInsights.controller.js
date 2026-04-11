import asyncHandler from "../utils/asyncHandler.js";
import {
  getLecturerPerformanceDashboard,
  getLecturerSessions,
  getSessionStudents,
  markAttendance,
} from "../services/performanceInsights.service.js";

export const getDashboardController = asyncHandler(async (req, res) => {
  const data = await getLecturerPerformanceDashboard(req.user._id);
  res.status(200).json({ success: true, data });
});

export const getSessionsController = asyncHandler(async (req, res) => {
  const sessions = await getLecturerSessions(req.user._id);
  res.status(200).json({ success: true, data: sessions });
});

export const getSessionStudentsController = asyncHandler(async (req, res) => {
  const { entryId, date } = req.params;
  const data = await getSessionStudents(req.user._id, entryId, date);
  res.status(200).json({ success: true, data });
});

export const markAttendanceController = asyncHandler(async (req, res) => {
  const result = await markAttendance(req.user._id, req.body);
  res.status(200).json({ success: true, message: `Attendance recorded for ${result.marked} students.`, data: result });
});
