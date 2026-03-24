import asyncHandler from "../utils/asyncHandler.js";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  duplicateTimetableToGroups,
  filterTimetableBySemesterAndGroup,
  getAllTimetableEntries,
  getTimetableEntryById,
  updateTimetableEntry,
} from "../services/timetable.service.js";

export const createTimetableEntryController = asyncHandler(async (req, res) => {
  const entry = await createTimetableEntry(req.body);

  res.status(201).json({
    success: true,
    message: "Timetable entry created successfully",
    data: entry,
  });
});

export const getAllTimetableEntriesController = asyncHandler(async (_req, res) => {
  const entries = await getAllTimetableEntries();

  res.status(200).json({
    success: true,
    message: "Timetable entries fetched successfully",
    data: entries,
  });
});

export const filterTimetableBySemesterAndGroupController = asyncHandler(async (req, res) => {
  const entries = await filterTimetableBySemesterAndGroup(req.params.semester, req.params.groupNumber);

  res.status(200).json({
    success: true,
    message: "Timetable entries filtered successfully",
    data: entries,
  });
});

export const getTimetableEntryByIdController = asyncHandler(async (req, res) => {
  const entry = await getTimetableEntryById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Timetable entry fetched successfully",
    data: entry,
  });
});

export const updateTimetableEntryController = asyncHandler(async (req, res) => {
  const entry = await updateTimetableEntry(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Timetable entry updated successfully",
    data: entry,
  });
});

export const deleteTimetableEntryController = asyncHandler(async (req, res) => {
  await deleteTimetableEntry(req.params.id);

  res.status(200).json({
    success: true,
    message: "Timetable entry deleted successfully",
  });
});

export const duplicateTimetableToGroupsController = asyncHandler(async (req, res) => {
  const result = await duplicateTimetableToGroups(req.body || {});

  res.status(200).json({
    success: true,
    message: "Timetable duplicated successfully",
    data: result,
  });
});
