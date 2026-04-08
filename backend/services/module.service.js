import mongoose from "mongoose";

import { ACADEMIC_FACULTY, ACADEMIC_SEMESTERS, ACADEMIC_YEAR } from "../constants/academicScope.js";
import Module from "../models/Module.js";
import AppError from "../utils/appError.js";

const VALID_YEARS = [1, 2, 3, 4];

const normalizeModuleCode = (value = "") => String(value).trim().toUpperCase();

const validateSemester = (semester) => {
  const parsed = Number(semester);
  if (!ACADEMIC_SEMESTERS.includes(parsed)) {
    throw new AppError("Semester must be 1 or 2", 400);
  }
  return parsed;
};

const validateAcademicYear = (year) => {
  const parsed = Number(year);
  if (!VALID_YEARS.includes(parsed)) {
    throw new AppError("Academic year must be between 1 and 4", 400);
  }
  return parsed;
};

const normalizeAssessmentCriteria = (criteria) => {
  if (!criteria) return [];

  if (!Array.isArray(criteria)) {
    throw new AppError("assessmentCriteria must be an array", 400);
  }

  return criteria.map((item, index) => {
    if (!item?.title || item?.percentage === undefined) {
      throw new AppError(`assessmentCriteria[${index}] must include title and percentage`, 400);
    }

    return {
      title: String(item.title).trim(),
      percentage: Number(item.percentage),
    };
  });
};

const normalizeLecturerAssignments = (assignments) => {
  if (!assignments) return [];

  if (!Array.isArray(assignments)) {
    throw new AppError("lecturerAssignments must be an array", 400);
  }

  return assignments
    .filter((item) => item?.group && item?.lecturer)
    .map((item, index) => {
      const group = Number(item.group);
      if (!Number.isInteger(group) || group < 1) {
        throw new AppError(`lecturerAssignments[${index}] has invalid group number`, 400);
      }

      if (!mongoose.Types.ObjectId.isValid(item.lecturer)) {
        throw new AppError(`lecturerAssignments[${index}] has invalid lecturer id`, 400);
      }

      return { group, lecturer: item.lecturer };
    });
};

const buildCreatePayload = (payload) => {
  if (!payload.moduleCode || !payload.moduleName || payload.semester === undefined) {
    throw new AppError("moduleCode, moduleName, and semester are required", 400);
  }

  const result = {
    moduleCode: normalizeModuleCode(payload.moduleCode),
    moduleName: String(payload.moduleName).trim(),
    semester: validateSemester(payload.semester),
    academicYear: payload.academicYear !== undefined
      ? validateAcademicYear(payload.academicYear)
      : ACADEMIC_YEAR,
    lectureHoursPerWeek: payload.lectureHoursPerWeek ?? 0,
    tutorialHoursPerWeek: payload.tutorialHoursPerWeek ?? 0,
    labHoursPerWeek: payload.labHoursPerWeek ?? 0,
    outline: payload.outline || "",
    assessmentCriteria: normalizeAssessmentCriteria(payload.assessmentCriteria),
    faculty: ACADEMIC_FACULTY,
  };

  if (payload.programme !== undefined) {
    result.programme = payload.programme || null;
  }

  if (payload.credits !== undefined) {
    const credits = Number(payload.credits);
    if (credits < 1 || credits > 10) {
      throw new AppError("Credits must be between 1 and 10", 400);
    }
    result.credits = credits;
  }

  if (payload.lecturer !== undefined) {
    result.lecturer = payload.lecturer || null;
  }

  if (payload.lecturerAssignments !== undefined) {
    result.lecturerAssignments = normalizeLecturerAssignments(payload.lecturerAssignments);
  }

  return result;
};

const buildUpdatePayload = (payload) => {
  const nextPayload = {};

  if (payload.moduleCode !== undefined) {
    nextPayload.moduleCode = normalizeModuleCode(payload.moduleCode);
  }

  if (payload.moduleName !== undefined) {
    nextPayload.moduleName = String(payload.moduleName).trim();
  }

  if (payload.semester !== undefined) {
    nextPayload.semester = validateSemester(payload.semester);
  }

  if (payload.academicYear !== undefined) {
    nextPayload.academicYear = validateAcademicYear(payload.academicYear);
  }

  if (payload.programme !== undefined) {
    nextPayload.programme = payload.programme || null;
  }

  if (payload.credits !== undefined) {
    const credits = Number(payload.credits);
    if (credits < 1 || credits > 10) {
      throw new AppError("Credits must be between 1 and 10", 400);
    }
    nextPayload.credits = credits;
  }

  if (payload.lectureHoursPerWeek !== undefined) {
    nextPayload.lectureHoursPerWeek = payload.lectureHoursPerWeek;
  }

  if (payload.tutorialHoursPerWeek !== undefined) {
    nextPayload.tutorialHoursPerWeek = payload.tutorialHoursPerWeek;
  }

  if (payload.labHoursPerWeek !== undefined) {
    nextPayload.labHoursPerWeek = payload.labHoursPerWeek;
  }

  if (payload.outline !== undefined) {
    nextPayload.outline = payload.outline;
  }

  if (payload.assessmentCriteria !== undefined) {
    nextPayload.assessmentCriteria = normalizeAssessmentCriteria(payload.assessmentCriteria);
  }

  if (payload.lecturer !== undefined) {
    nextPayload.lecturer = payload.lecturer || null;
  }

  if (payload.lecturerAssignments !== undefined) {
    nextPayload.lecturerAssignments = normalizeLecturerAssignments(payload.lecturerAssignments);
  }

  nextPayload.faculty = ACADEMIC_FACULTY;

  return nextPayload;
};

export const createModule = async (payload) => {
  const createPayload = buildCreatePayload(payload);

  const duplicate = await Module.findOne({ moduleCode: createPayload.moduleCode });
  if (duplicate) {
    throw new AppError("Module code already exists", 409);
  }

  const createdModule = await Module.create(createPayload);
  return createdModule;
};

export const getAllModules = async (filters = {}) => {
  const query = { faculty: ACADEMIC_FACULTY };

  if (filters.academicYear) {
    query.academicYear = Number(filters.academicYear);
  }

  if (filters.programme) {
    query.programme = filters.programme;
  }

  if (filters.semester) {
    query.semester = Number(filters.semester);
  }

  const modules = await Module.find(query)
    .populate("lecturer", "name email department")
    .populate("programme", "programmeCode programmeName programmeType duration groups")
    .populate("lecturerAssignments.lecturer", "name email department")
    .sort({ academicYear: 1, semester: 1, moduleCode: 1 });

  return modules;
};

export const filterModulesBySemester = async (semester) => {
  const validatedSemester = validateSemester(semester);

  const modules = await Module.find({
    faculty: ACADEMIC_FACULTY,
    semester: validatedSemester,
  })
    .populate("lecturer", "name email department")
    .populate("programme", "programmeCode programmeName programmeType duration groups")
    .populate("lecturerAssignments.lecturer", "name email department")
    .sort({ moduleCode: 1 });

  return modules;
};

export const getModuleById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid module id", 400);
  }

  const module = await Module.findById(id);

  if (!module) {
    throw new AppError("Module not found", 404);
  }

  return module;
};

export const updateModule = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid module id", 400);
  }

  const updatePayload = buildUpdatePayload(payload);

  if (updatePayload.moduleCode) {
    const duplicate = await Module.findOne({
      moduleCode: updatePayload.moduleCode,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new AppError("Module code already exists", 409);
    }
  }

  const updatedModule = await Module.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!updatedModule) {
    throw new AppError("Module not found", 404);
  }

  return updatedModule;
};

export const deleteModule = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid module id", 400);
  }

  const deletedModule = await Module.findByIdAndDelete(id);

  if (!deletedModule) {
    throw new AppError("Module not found", 404);
  }

  return deletedModule;
};
