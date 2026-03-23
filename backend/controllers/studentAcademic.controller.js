import asyncHandler from "../utils/asyncHandler.js";
import {
  getMyEvents,
  getMyModules,
  getMyTimetable,
} from "../services/studentAcademic.service.js";

export const getMyModulesController = asyncHandler(async (req, res) => {
  const result = await getMyModules(req.user);

  res.status(200).json({
    success: true,
    message: "Student modules fetched successfully",
    data: {
      scope: result.scope,
      modules: result.items,
    },
  });
});

export const getMyTimetableController = asyncHandler(async (req, res) => {
  const result = await getMyTimetable(req.user);

  res.status(200).json({
    success: true,
    message: "Student timetable fetched successfully",
    data: {
      scope: result.scope,
      timetable: result.items,
    },
  });
});

export const getMyEventsController = asyncHandler(async (req, res) => {
  const result = await getMyEvents(req.user);

  res.status(200).json({
    success: true,
    message: "Student events fetched successfully",
    data: {
      scope: result.scope,
      events: result.items,
    },
  });
});
