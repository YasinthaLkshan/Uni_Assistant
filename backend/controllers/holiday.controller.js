import asyncHandler from "../utils/asyncHandler.js";
import {
  createHoliday,
  deleteHoliday,
  getAllHolidays,
  getHolidayById,
  getHolidaysInRange,
  updateHoliday,
} from "../services/holiday.service.js";

export const createHolidayController = asyncHandler(async (req, res) => {
  const holiday = await createHoliday(req.body);

  res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    data: holiday,
  });
});

export const getAllHolidaysController = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.year) filters.year = req.query.year;
  if (req.query.type) filters.type = req.query.type;

  const holidays = await getAllHolidays(filters);

  res.status(200).json({
    success: true,
    message: "Holidays fetched successfully",
    data: holidays,
  });
});

export const getHolidaysInRangeController = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: "start and end query params are required",
    });
  }

  const holidays = await getHolidaysInRange(start, end);

  res.status(200).json({
    success: true,
    message: "Holidays in range fetched",
    data: holidays,
  });
});

export const getHolidayByIdController = asyncHandler(async (req, res) => {
  const holiday = await getHolidayById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Holiday fetched successfully",
    data: holiday,
  });
});

export const updateHolidayController = asyncHandler(async (req, res) => {
  const holiday = await updateHoliday(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Holiday updated successfully",
    data: holiday,
  });
});

export const deleteHolidayController = asyncHandler(async (req, res) => {
  await deleteHoliday(req.params.id);

  res.status(200).json({
    success: true,
    message: "Holiday deleted successfully",
  });
});
