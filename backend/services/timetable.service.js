import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";
import Module from "../models/Module.js";
import TimetableEntry from "../models/TimetableEntry.js";
import AppError from "../utils/appError.js";

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const buildScopedQuery = (filters = {}) => {
  const query = {
    faculty: ACADEMIC_FACULTY,
    $or: [{ academicYear: ACADEMIC_YEAR }, { year: ACADEMIC_YEAR }],
  };

  if (filters.semester !== undefined && filters.semester !== "") {
    query.semester = validateSemester(filters.semester);
  }

  if (filters.groupNumber !== undefined && filters.groupNumber !== "") {
    query.groupNumber = validateGroupNumber(filters.groupNumber);
  }

  return query;
};

const normalizeModuleCode = (value = "") => String(value).trim().toUpperCase();
const normalizeModuleName = (value = "") => String(value).trim();

const parseTimeToMinutes = (time) => {
  const value = String(time || "").trim();
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    throw new AppError("Time must be in HH:mm format", 400);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new AppError("Time must be in HH:mm format", 400);
  }

  return hours * 60 + minutes;
};

const validateTimeRange = (startTime, endTime) => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    throw new AppError("endTime must be later than startTime", 400);
  }
};

const validateSemester = (semester) => {
  const parsed = Number(semester);
  if (!ACADEMIC_SEMESTERS.includes(parsed)) {
    throw new AppError("Semester must be 1 or 2", 400);
  }
  return parsed;
};

const validateGroupNumber = (groupNumber) => {
  const parsed = Number(groupNumber);
  if (!ACADEMIC_GROUPS.includes(parsed)) {
    throw new AppError("Group number must be 1, 2, or 3", 400);
  }
  return parsed;
};

const validateDayOfWeek = (dayOfWeek) => {
  const day = String(dayOfWeek || "").trim();
  if (!Object.keys(DAY_ORDER).includes(day)) {
    throw new AppError("dayOfWeek must be Monday to Saturday", 400);
  }
  return day;
};

const validateActivityType = (activityType) => {
  const allowed = ["Lecture", "Tutorial", "Lab", "Practical", "Workshop", "Evaluation"];
  const value = String(activityType || "").trim();

  if (!allowed.includes(value)) {
    throw new AppError("Invalid activityType", 400);
  }

  return value;
};

const normalizeLecturerNames = (lecturerNames) => {
  if (lecturerNames === undefined || lecturerNames === null) {
    return [];
  }

  if (!Array.isArray(lecturerNames)) {
    throw new AppError("lecturerNames must be an array of strings", 400);
  }

  const normalized = lecturerNames
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  if (normalized.length !== lecturerNames.length) {
    throw new AppError("lecturerNames must not contain empty values", 400);
  }

  return normalized;
};

const getSortedTimetable = (entries = []) => {
  return [...entries].sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayDiff !== 0) {
      return dayDiff;
    }

    return String(a.startTime).localeCompare(String(b.startTime));
  });
};

const ensureModuleIfProvided = async (moduleId) => {
  if (!moduleId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    throw new AppError("Invalid module id", 400);
  }

  const existingModule = await Module.findById(moduleId).lean();
  if (!existingModule) {
    throw new AppError("Module not found", 404);
  }

  return moduleId;
};

const buildCreatePayload = async (payload) => {
  if (
    payload.semester === undefined ||
    payload.groupNumber === undefined ||
    payload.moduleCode === undefined ||
    payload.moduleName === undefined ||
    payload.dayOfWeek === undefined ||
    payload.activityType === undefined ||
    payload.startTime === undefined ||
    payload.endTime === undefined ||
    payload.venue === undefined
  ) {
    throw new AppError(
      "semester, groupNumber, moduleCode, moduleName, dayOfWeek, activityType, startTime, endTime, and venue are required",
      400
    );
  }

  validateTimeRange(payload.startTime, payload.endTime);

  const lecturerNames = normalizeLecturerNames(payload.lecturerNames);
  const moduleId = await ensureModuleIfProvided(payload.module);

  return {
    faculty: ACADEMIC_FACULTY,
    academicYear: ACADEMIC_YEAR,
    year: ACADEMIC_YEAR,
    semester: validateSemester(payload.semester),
    groupNumber: validateGroupNumber(payload.groupNumber),
    module: moduleId,
    moduleCode: normalizeModuleCode(payload.moduleCode),
    moduleName: normalizeModuleName(payload.moduleName),
    dayOfWeek: validateDayOfWeek(payload.dayOfWeek),
    activityType: validateActivityType(payload.activityType),
    startTime: String(payload.startTime).trim(),
    endTime: String(payload.endTime).trim(),
    lecturerNames,
    venue: String(payload.venue).trim(),
    note: payload.note ? String(payload.note).trim() : "",
  };
};

const buildUpdatePayload = async (payload) => {
  const nextPayload = {
    faculty: ACADEMIC_FACULTY,
    academicYear: ACADEMIC_YEAR,
    year: ACADEMIC_YEAR,
  };

  if (payload.semester !== undefined) {
    nextPayload.semester = validateSemester(payload.semester);
  }

  if (payload.groupNumber !== undefined) {
    nextPayload.groupNumber = validateGroupNumber(payload.groupNumber);
  }

  if (payload.module !== undefined) {
    nextPayload.module = await ensureModuleIfProvided(payload.module);
  }

  if (payload.moduleCode !== undefined) {
    nextPayload.moduleCode = normalizeModuleCode(payload.moduleCode);
  }

  if (payload.moduleName !== undefined) {
    nextPayload.moduleName = normalizeModuleName(payload.moduleName);
  }

  if (payload.dayOfWeek !== undefined) {
    nextPayload.dayOfWeek = validateDayOfWeek(payload.dayOfWeek);
  }

  if (payload.activityType !== undefined) {
    nextPayload.activityType = validateActivityType(payload.activityType);
  }

  const nextStartTime = payload.startTime !== undefined ? String(payload.startTime).trim() : undefined;
  const nextEndTime = payload.endTime !== undefined ? String(payload.endTime).trim() : undefined;

  if (nextStartTime !== undefined) {
    nextPayload.startTime = nextStartTime;
  }

  if (nextEndTime !== undefined) {
    nextPayload.endTime = nextEndTime;
  }

  if (nextStartTime !== undefined || nextEndTime !== undefined) {
    const start = nextStartTime !== undefined ? nextStartTime : payload.currentStartTime;
    const end = nextEndTime !== undefined ? nextEndTime : payload.currentEndTime;
    validateTimeRange(start, end);
  }

  if (payload.lecturerNames !== undefined) {
    nextPayload.lecturerNames = normalizeLecturerNames(payload.lecturerNames);
  }

  if (payload.venue !== undefined) {
    nextPayload.venue = String(payload.venue).trim();
  }

  if (payload.note !== undefined) {
    nextPayload.note = payload.note ? String(payload.note).trim() : "";
  }

  return nextPayload;
};

export const createTimetableEntry = async (payload) => {
  const createPayload = await buildCreatePayload(payload);

  const created = await TimetableEntry.create(createPayload);

  return created;
};

export const getAllTimetableEntries = async () => {
  const entries = await TimetableEntry.find(buildScopedQuery()).populate("module").lean();
  return getSortedTimetable(entries);
};

export const filterTimetableBySemesterAndGroup = async (semester, groupNumber) => {
  const entries = await TimetableEntry.find(
    buildScopedQuery({
      semester,
      groupNumber,
    })
  )
    .populate("module")
    .lean();

  return getSortedTimetable(entries);
};

export const getTimetableEntryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid timetable entry id", 400);
  }

  const entry = await TimetableEntry.findOne({
    _id: id,
    ...buildScopedQuery(),
  }).populate("module");

  if (!entry) {
    throw new AppError("Timetable entry not found", 404);
  }

  return entry;
};

export const updateTimetableEntry = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid timetable entry id", 400);
  }

  const existing = await TimetableEntry.findOne({
    _id: id,
    ...buildScopedQuery(),
  });

  if (!existing) {
    throw new AppError("Timetable entry not found", 404);
  }

  const updatePayload = await buildUpdatePayload({
    ...payload,
    currentStartTime: existing.startTime,
    currentEndTime: existing.endTime,
  });

  const updated = await TimetableEntry.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate("module");

  return updated;
};

export const deleteTimetableEntry = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid timetable entry id", 400);
  }

  const deleted = await TimetableEntry.findOneAndDelete({
    _id: id,
    ...buildScopedQuery(),
  });

  if (!deleted) {
    throw new AppError("Timetable entry not found", 404);
  }

  return deleted;
};
