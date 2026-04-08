import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";
import Programme, { PROGRAMME_TYPES_LIST } from "../models/Programme.js";
import AppError from "../utils/appError.js";

const normalizeProgrammeCode = (value = "") => String(value).trim().toUpperCase();

const validateProgrammeType = (type) => {
  if (!PROGRAMME_TYPES_LIST.includes(type)) {
    throw new AppError(
      `Programme type must be one of: ${PROGRAMME_TYPES_LIST.join(", ")}`,
      400
    );
  }
  return type;
};

const validateDuration = (duration) => {
  const parsed = Number(duration);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) {
    throw new AppError("Duration must be between 1 and 4 years", 400);
  }
  return parsed;
};

const normalizeGroups = (groups) => {
  if (!groups) return [1, 2, 3];

  if (!Array.isArray(groups)) {
    throw new AppError("Groups must be an array of numbers", 400);
  }

  const parsed = groups.map((g) => Number(g)).filter((g) => Number.isInteger(g) && g >= 1);
  if (parsed.length === 0) {
    throw new AppError("Groups must have at least one valid group number", 400);
  }

  return [...new Set(parsed)].sort((a, b) => a - b);
};

const buildCreatePayload = (payload) => {
  if (!payload.programmeCode || !payload.programmeName || !payload.programmeType || payload.duration === undefined) {
    throw new AppError("programmeCode, programmeName, programmeType, and duration are required", 400);
  }

  return {
    programmeCode: normalizeProgrammeCode(payload.programmeCode),
    programmeName: String(payload.programmeName).trim(),
    programmeType: validateProgrammeType(payload.programmeType),
    duration: validateDuration(payload.duration),
    faculty: ACADEMIC_FACULTY,
    groups: normalizeGroups(payload.groups),
    description: payload.description || "",
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  };
};

const buildUpdatePayload = (payload) => {
  const nextPayload = {};

  if (payload.programmeCode !== undefined) {
    nextPayload.programmeCode = normalizeProgrammeCode(payload.programmeCode);
  }

  if (payload.programmeName !== undefined) {
    nextPayload.programmeName = String(payload.programmeName).trim();
  }

  if (payload.programmeType !== undefined) {
    nextPayload.programmeType = validateProgrammeType(payload.programmeType);
  }

  if (payload.duration !== undefined) {
    nextPayload.duration = validateDuration(payload.duration);
  }

  if (payload.groups !== undefined) {
    nextPayload.groups = normalizeGroups(payload.groups);
  }

  if (payload.description !== undefined) {
    nextPayload.description = payload.description;
  }

  if (payload.isActive !== undefined) {
    nextPayload.isActive = Boolean(payload.isActive);
  }

  nextPayload.faculty = ACADEMIC_FACULTY;

  return nextPayload;
};

export const createProgramme = async (payload) => {
  const createPayload = buildCreatePayload(payload);

  const duplicate = await Programme.findOne({ programmeCode: createPayload.programmeCode });
  if (duplicate) {
    throw new AppError("Programme code already exists", 409);
  }

  const created = await Programme.create(createPayload);
  return created;
};

export const getAllProgrammes = async () => {
  const programmes = await Programme.find({ faculty: ACADEMIC_FACULTY })
    .sort({ programmeType: 1, programmeCode: 1 });

  return programmes;
};

export const filterProgrammesByType = async (type) => {
  const validatedType = validateProgrammeType(type);

  const programmes = await Programme.find({
    faculty: ACADEMIC_FACULTY,
    programmeType: validatedType,
  }).sort({ programmeCode: 1 });

  return programmes;
};

export const getProgrammeById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid programme id", 400);
  }

  const programme = await Programme.findById(id);
  if (!programme) {
    throw new AppError("Programme not found", 404);
  }

  return programme;
};

export const updateProgramme = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid programme id", 400);
  }

  const updatePayload = buildUpdatePayload(payload);

  if (updatePayload.programmeCode) {
    const duplicate = await Programme.findOne({
      programmeCode: updatePayload.programmeCode,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new AppError("Programme code already exists", 409);
    }
  }

  const updated = await Programme.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError("Programme not found", 404);
  }

  return updated;
};

export const deleteProgramme = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid programme id", 400);
  }

  const deleted = await Programme.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError("Programme not found", 404);
  }

  return deleted;
};
