import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";
import AcademicEvent from "../models/AcademicEvent.js";
import AcademicModule from "../models/AcademicModule.js";
import StudentProfile from "../models/StudentProfile.js";
import TimetableEntry from "../models/TimetableEntry.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const ENTITY_MAP = {
  "student-profiles": {
    model: StudentProfile,
    sort: { createdAt: -1 },
    requiredFields: ["studentId", "fullName", "email", "semester", "groupNumber"],
  },
  modules: {
    model: AcademicModule,
    sort: { semester: 1, moduleCode: 1 },
    requiredFields: ["moduleCode", "title", "semester"],
  },
  timetable: {
    model: TimetableEntry,
    sort: { semester: 1, groupNumber: 1, dayOfWeek: 1, startTime: 1 },
    requiredFields: [
      "moduleCode",
      "moduleTitle",
      "dayOfWeek",
      "startTime",
      "endTime",
      "venue",
      "semester",
      "groupNumber",
    ],
  },
  events: {
    model: AcademicEvent,
    sort: { eventDate: 1, startTime: 1 },
    requiredFields: ["title", "eventType", "eventDate", "semester", "groupNumber"],
  },
};

const getEntityConfig = (entityKey) => {
  const config = ENTITY_MAP[entityKey];
  if (!config) {
    throw new AppError("Unsupported academic entity", 400);
  }
  return config;
};

const buildScopeQuery = (query = {}) => {
  const scoped = {
    faculty: ACADEMIC_FACULTY,
    year: ACADEMIC_YEAR,
  };

  if (query.semester !== undefined) {
    const semester = Number(query.semester);
    if (!ACADEMIC_SEMESTERS.includes(semester)) {
      throw new AppError("Semester must be 1 or 2", 400);
    }
    scoped.semester = semester;
  }

  if (query.groupNumber !== undefined) {
    const groupNumber = Number(query.groupNumber);
    if (!ACADEMIC_GROUPS.includes(groupNumber)) {
      throw new AppError("Group number must be 1, 2, or 3", 400);
    }
    scoped.groupNumber = groupNumber;
  }

  return scoped;
};

const ensureRequiredFields = (payload, requiredFields) => {
  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, 400);
  }
};

const normalizePayload = (entityKey, payload) => {
  const normalized = { ...payload };

  if (normalized.studentId) {
    normalized.studentId = String(normalized.studentId).trim().toUpperCase();
  }

  if (normalized.email) {
    normalized.email = String(normalized.email).trim().toLowerCase();
  }

  if (normalized.moduleCode) {
    normalized.moduleCode = String(normalized.moduleCode).trim().toUpperCase();
  }

  if (entityKey === "modules" && Array.isArray(normalized.groups)) {
    normalized.groups = [...new Set(normalized.groups.map((value) => Number(value)).filter((value) => ACADEMIC_GROUPS.includes(value)))];
    if (normalized.groups.length === 0) {
      normalized.groups = ACADEMIC_GROUPS;
    }
  }

  if (normalized.semester !== undefined) {
    normalized.semester = Number(normalized.semester);
  }

  if (normalized.groupNumber !== undefined) {
    normalized.groupNumber = Number(normalized.groupNumber);
  }

  normalized.faculty = ACADEMIC_FACULTY;
  normalized.year = ACADEMIC_YEAR;

  return normalized;
};

export const getAcademicOverview = asyncHandler(async (_req, res) => {
  const [studentProfiles, modules, timetableEntries, events] = await Promise.all([
    StudentProfile.countDocuments({ faculty: ACADEMIC_FACULTY, year: ACADEMIC_YEAR }),
    AcademicModule.countDocuments({ faculty: ACADEMIC_FACULTY, year: ACADEMIC_YEAR }),
    TimetableEntry.countDocuments({ faculty: ACADEMIC_FACULTY, year: ACADEMIC_YEAR }),
    AcademicEvent.countDocuments({ faculty: ACADEMIC_FACULTY, year: ACADEMIC_YEAR }),
  ]);

  res.status(200).json({
    success: true,
    message: "Academic overview fetched successfully",
    data: {
      scope: {
        faculty: ACADEMIC_FACULTY,
        year: ACADEMIC_YEAR,
        semesters: ACADEMIC_SEMESTERS,
        groups: ACADEMIC_GROUPS,
      },
      totals: {
        studentProfiles,
        modules,
        timetableEntries,
        events,
      },
    },
  });
});

export const listAcademicEntity = asyncHandler(async (req, res) => {
  const { entity } = req.params;
  const { model, sort } = getEntityConfig(entity);
  const query = buildScopeQuery(req.query);

  const records = await model.find(query).sort(sort).lean();

  res.status(200).json({
    success: true,
    message: `${entity} fetched successfully`,
    data: records,
  });
});

export const createAcademicEntity = asyncHandler(async (req, res) => {
  const { entity } = req.params;
  const { model, requiredFields } = getEntityConfig(entity);
  const normalizedPayload = normalizePayload(entity, req.body);

  ensureRequiredFields(normalizedPayload, requiredFields);

  const created = await model.create(normalizedPayload);

  res.status(201).json({
    success: true,
    message: `${entity} created successfully`,
    data: created,
  });
});

export const updateAcademicEntity = asyncHandler(async (req, res) => {
  const { entity, id } = req.params;
  const { model } = getEntityConfig(entity);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid record id", 400);
  }

  const normalizedPayload = normalizePayload(entity, req.body);

  const updated = await model.findOneAndUpdate(
    {
      _id: id,
      faculty: ACADEMIC_FACULTY,
      year: ACADEMIC_YEAR,
    },
    normalizedPayload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    throw new AppError("Record not found", 404);
  }

  res.status(200).json({
    success: true,
    message: `${entity} updated successfully`,
    data: updated,
  });
});

export const deleteAcademicEntity = asyncHandler(async (req, res) => {
  const { entity, id } = req.params;
  const { model } = getEntityConfig(entity);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid record id", 400);
  }

  const deleted = await model.findOneAndDelete({
    _id: id,
    faculty: ACADEMIC_FACULTY,
    year: ACADEMIC_YEAR,
  });

  if (!deleted) {
    throw new AppError("Record not found", 404);
  }

  res.status(200).json({
    success: true,
    message: `${entity} deleted successfully`,
  });
});
