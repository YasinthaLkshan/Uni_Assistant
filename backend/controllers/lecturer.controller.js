import asyncHandler from "../utils/asyncHandler.js";
import {
  getLecturerDashboard,
  getLecturerTimetable,
  getLecturerNotices,
} from "../services/lecturer.service.js";

export const getDashboardController = asyncHandler(async (req, res) => {
  const data = await getLecturerDashboard(req.user._id);

  res.status(200).json({
    success: true,
    message: "Lecturer dashboard fetched successfully",
    data,
  });
});

export const getMyTimetableController = asyncHandler(async (req, res) => {
  const timetable = await getLecturerTimetable(req.user._id);

  res.status(200).json({
    success: true,
    message: "Lecturer timetable fetched successfully",
    data: timetable,
  });
});

export const getNoticesController = asyncHandler(async (req, res) => {
  const notices = await getLecturerNotices();

  res.status(200).json({
    success: true,
    message: "Notices fetched successfully",
    data: notices,
  });
});
