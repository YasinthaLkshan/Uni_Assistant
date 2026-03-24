import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";
import AcademicEvent from "../models/AcademicEvent.js";
import Module from "../models/Module.js";
import AppError from "../utils/appError.js";

const ALLOWED_EVENT_TYPES = ["Assignment", "Presentation", "Viva", "Lab Test", "Exam", "Spot Test", "Seminar"];

const normalizeModuleCode = (value = "") => String(value).trim().toUpperCase();

const parseTimeToMinutes = (time) => {
  const value = String(time || "").trim();

  if (!value) {
    return null;
  }

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
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (start !== null && end !== null && end <= start) {
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

const validateEventType = (eventType) => {
  const value = String(eventType || "").trim();
  if (!ALLOWED_EVENT_TYPES.includes(value)) {
    throw new AppError(`eventType must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}`, 400);
  }
  return value;
};

const validateWeightPercentage = (value) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    throw new AppError("weightPercentage must be between 0 and 100", 400);
  }

  return parsed;
};

const validateObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label} id`, 400);
  }
};

const ensureModuleIfProvided = async (moduleId) => {
  if (!moduleId) {
    return null;
  }

  validateObjectId(moduleId, "module");

  const module = await Module.findById(moduleId).lean();
  if (!module) {
    throw new AppError("Module not found", 404);
  }

  return moduleId;
};

const buildScopeQuery = (filters = {}) => {
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

  if (filters.eventType !== undefined && filters.eventType !== "") {
    query.eventType = validateEventType(filters.eventType);
  }

  if (filters.module !== undefined && filters.module !== "") {
    validateObjectId(filters.module, "module");
    query.module = filters.module;
  }

  if (filters.moduleCode !== undefined && filters.moduleCode !== "") {
    query.moduleCode = normalizeModuleCode(filters.moduleCode);
  }

  return query;
};

const buildCreatePayload = async (payload) => {
  if (
    payload.semester === undefined ||
    payload.groupNumber === undefined ||
    payload.moduleCode === undefined ||
    payload.moduleName === undefined ||
    payload.title === undefined ||
    payload.eventType === undefined ||
    payload.eventDate === undefined
  ) {
    throw new AppError(
      "semester, groupNumber, moduleCode, moduleName, title, eventType, and eventDate are required",
      400
    );
  }

  validateTimeRange(payload.startTime, payload.endTime);

  return {
    faculty: ACADEMIC_FACULTY,
    academicYear: ACADEMIC_YEAR,
    year: ACADEMIC_YEAR,
    semester: validateSemester(payload.semester),
    groupNumber: validateGroupNumber(payload.groupNumber),
    module: await ensureModuleIfProvided(payload.module),
    moduleCode: normalizeModuleCode(payload.moduleCode),
    moduleName: String(payload.moduleName).trim(),
    title: String(payload.title).trim(),
    eventType: validateEventType(payload.eventType),
    description: payload.description ? String(payload.description).trim() : "",
    eventDate: new Date(payload.eventDate),
    startTime: payload.startTime ? String(payload.startTime).trim() : "",
    endTime: payload.endTime ? String(payload.endTime).trim() : "",
    venue: payload.venue ? String(payload.venue).trim() : "",
    weightPercentage: validateWeightPercentage(payload.weightPercentage),
    status: payload.status ? String(payload.status).trim() : "Scheduled",
  };
};

const buildUpdatePayload = async (payload, existing) => {
  const update = {
    faculty: ACADEMIC_FACULTY,
    academicYear: ACADEMIC_YEAR,
    year: ACADEMIC_YEAR,
  };

  if (payload.semester !== undefined) {
    update.semester = validateSemester(payload.semester);
  }

  if (payload.groupNumber !== undefined) {
    update.groupNumber = validateGroupNumber(payload.groupNumber);
  }

  if (payload.module !== undefined) {
    update.module = await ensureModuleIfProvided(payload.module);
  }

  if (payload.moduleCode !== undefined) {
    update.moduleCode = normalizeModuleCode(payload.moduleCode);
  }

  if (payload.moduleName !== undefined) {
    update.moduleName = String(payload.moduleName).trim();
  }

  if (payload.title !== undefined) {
    update.title = String(payload.title).trim();
  }

  if (payload.eventType !== undefined) {
    update.eventType = validateEventType(payload.eventType);
  }

  if (payload.description !== undefined) {
    update.description = payload.description ? String(payload.description).trim() : "";
  }

  if (payload.eventDate !== undefined) {
    update.eventDate = new Date(payload.eventDate);
  }

  if (payload.startTime !== undefined) {
    update.startTime = payload.startTime ? String(payload.startTime).trim() : "";
  }

  if (payload.endTime !== undefined) {
    update.endTime = payload.endTime ? String(payload.endTime).trim() : "";
  }

  validateTimeRange(update.startTime ?? existing.startTime, update.endTime ?? existing.endTime);

  if (payload.venue !== undefined) {
    update.venue = payload.venue ? String(payload.venue).trim() : "";
  }

  if (payload.weightPercentage !== undefined) {
    update.weightPercentage = validateWeightPercentage(payload.weightPercentage);
  }

  if (payload.status !== undefined) {
    update.status = payload.status ? String(payload.status).trim() : "Scheduled";
  }

  return update;
};

export const createAcademicEvent = async (payload) => {
  const createPayload = await buildCreatePayload(payload);

  const created = await AcademicEvent.create(createPayload);
  return created;
};

export const getAllAcademicEvents = async (filters = {}) => {
  const events = await AcademicEvent.find(buildScopeQuery(filters))
    .populate("module")
    .sort({ eventDate: 1, startTime: 1, createdAt: -1 });

  return events;
};

export const getAcademicEventById = async (id) => {
  validateObjectId(id, "academic event");

  const event = await AcademicEvent.findOne({
    _id: id,
    ...buildScopeQuery(),
  }).populate("module");

  if (!event) {
    throw new AppError("Academic event not found", 404);
  }

  return event;
};

export const updateAcademicEvent = async (id, payload) => {
  validateObjectId(id, "academic event");

  const existing = await AcademicEvent.findOne({
    _id: id,
    ...buildScopeQuery(),
  });

  if (!existing) {
    throw new AppError("Academic event not found", 404);
  }

  const updatePayload = await buildUpdatePayload(payload, existing);

  const updated = await AcademicEvent.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate("module");

  return updated;
};

export const deleteAcademicEvent = async (id) => {
  validateObjectId(id, "academic event");

  const deleted = await AcademicEvent.findOneAndDelete({
    _id: id,
    ...buildScopeQuery(),
  });

  if (!deleted) {
    throw new AppError("Academic event not found", 404);
  }

  return deleted;
};
