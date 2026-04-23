import mongoose from "mongoose";

import Holiday, { HOLIDAY_TYPES_LIST } from "../models/Holiday.js";
import AppError from "../utils/appError.js";

const normalizeDate = (dateValue) => {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) {
    throw new AppError("Invalid date", 400);
  }
  d.setHours(0, 0, 0, 0);
  return d;
};

const validateType = (type) => {
  if (!HOLIDAY_TYPES_LIST.includes(type)) {
    throw new AppError(`Holiday type must be one of: ${HOLIDAY_TYPES_LIST.join(", ")}`, 400);
  }
  return type;
};

export const createHoliday = async (payload) => {
  if (!payload.date || !payload.name || !payload.type) {
    throw new AppError("date, name, and type are required", 400);
  }

  const date = normalizeDate(payload.date);
  const type = validateType(payload.type);

  const duplicate = await Holiday.findOne({ date });
  if (duplicate) {
    throw new AppError("A holiday already exists on this date", 409);
  }

  const created = await Holiday.create({
    date,
    name: String(payload.name).trim(),
    type,
    description: payload.description || "",
  });

  return created;
};

export const getAllHolidays = async (filters = {}) => {
  const query = {};

  if (filters.year) {
    const y = Number(filters.year);
    query.date = {
      $gte: new Date(y, 0, 1),
      $lte: new Date(y, 11, 31, 23, 59, 59),
    };
  }

  if (filters.type) {
    query.type = validateType(filters.type);
  }

  const holidays = await Holiday.find(query).sort({ date: 1 });
  return holidays;
};

/**
 * Get holidays within a date range. Used by scheduling to block dates.
 */
export const getHolidaysInRange = async (startDate, endDate) => {
  const start = normalizeDate(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const holidays = await Holiday.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  return holidays;
};

/**
 * Check if a specific date is a holiday.
 */
export const isHoliday = async (date) => {
  const normalized = normalizeDate(date);
  const endOfDay = new Date(normalized);
  endOfDay.setHours(23, 59, 59, 999);

  const holiday = await Holiday.findOne({
    date: { $gte: normalized, $lte: endOfDay },
  });

  return holiday || null;
};

export const getHolidayById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid holiday id", 400);
  }

  const holiday = await Holiday.findById(id);
  if (!holiday) throw new AppError("Holiday not found", 404);

  return holiday;
};

export const updateHoliday = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid holiday id", 400);
  }

  const updatePayload = {};

  if (payload.date !== undefined) {
    const date = normalizeDate(payload.date);
    const duplicate = await Holiday.findOne({ date, _id: { $ne: id } });
    if (duplicate) {
      throw new AppError("A holiday already exists on this date", 409);
    }
    updatePayload.date = date;
  }

  if (payload.name !== undefined) {
    updatePayload.name = String(payload.name).trim();
  }

  if (payload.type !== undefined) {
    updatePayload.type = validateType(payload.type);
  }

  if (payload.description !== undefined) {
    updatePayload.description = payload.description;
  }

  const updated = await Holiday.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw new AppError("Holiday not found", 404);

  return updated;
};

export const deleteHoliday = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid holiday id", 400);
  }

  const deleted = await Holiday.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Holiday not found", 404);

  return deleted;
};
