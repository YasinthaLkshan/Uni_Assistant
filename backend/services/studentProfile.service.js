import mongoose from "mongoose";

import StudentProfile from "../models/StudentProfile.js";
import AppError from "../utils/appError.js";

const STUDENT_ID_REGEX = /^IT\d{8}$/;
const ALLOWED_SEMESTERS = [1, 2];
const ALLOWED_GROUPS = [1, 2, 3];

const normalizeStudentId = (value = "") => String(value).trim().toUpperCase();

const validateStudentId = (studentId) => {
  if (!STUDENT_ID_REGEX.test(studentId)) {
    throw new AppError("Student ID must be in format IT followed by 8 numbers", 400);
  }
};

const validateSemester = (semester) => {
  const parsed = Number(semester);
  if (!ALLOWED_SEMESTERS.includes(parsed)) {
    throw new AppError("Semester must be 1 or 2", 400);
  }
  return parsed;
};

const validateGroupNumber = (groupNumber) => {
  const parsed = Number(groupNumber);
  if (!ALLOWED_GROUPS.includes(parsed)) {
    throw new AppError("Group number must be 1, 2, or 3", 400);
  }
  return parsed;
};

const buildCreatePayload = (payload) => {
  const studentId = normalizeStudentId(payload.studentId);

  validateStudentId(studentId);

  return {
    studentId,
    fullName: payload.fullName,
    semester: validateSemester(payload.semester),
    groupNumber: validateGroupNumber(payload.groupNumber),
    registrationStatus: payload.registrationStatus || "pending",
    faculty: "IT",
    academicYear: 3,
    user: payload.user || null,
  };
};

const buildUpdatePayload = (payload) => {
  const nextPayload = {};

  if (payload.studentId !== undefined) {
    const studentId = normalizeStudentId(payload.studentId);
    validateStudentId(studentId);
    nextPayload.studentId = studentId;
  }

  if (payload.fullName !== undefined) {
    nextPayload.fullName = payload.fullName;
  }

  if (payload.semester !== undefined) {
    nextPayload.semester = validateSemester(payload.semester);
  }

  if (payload.groupNumber !== undefined) {
    nextPayload.groupNumber = validateGroupNumber(payload.groupNumber);
  }

  if (payload.registrationStatus !== undefined) {
    nextPayload.registrationStatus = payload.registrationStatus;
  }

  if (payload.user !== undefined) {
    nextPayload.user = payload.user;
  }

  nextPayload.faculty = "IT";
  nextPayload.academicYear = 3;

  return nextPayload;
};

export const createStudentProfile = async (payload) => {
  const createPayload = buildCreatePayload(payload);

  const existingProfile = await StudentProfile.findOne({ studentId: createPayload.studentId });
  if (existingProfile) {
    throw new AppError("Student ID already exists", 409);
  }

  const createdProfile = await StudentProfile.create(createPayload);
  return createdProfile;
};

export const getAllStudentProfiles = async (filters = {}) => {
  const query = {
    faculty: "IT",
    academicYear: 3,
  };

  if (filters.semester !== undefined && filters.semester !== "") {
    query.semester = validateSemester(filters.semester);
  }

  if (filters.groupNumber !== undefined && filters.groupNumber !== "") {
    query.groupNumber = validateGroupNumber(filters.groupNumber);
  }

  const profiles = await StudentProfile.find(query)
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  return profiles;
};

export const getStudentProfileById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid student profile id", 400);
  }

  const profile = await StudentProfile.findById(id).populate("user", "name email role");

  if (!profile) {
    throw new AppError("Student profile not found", 404);
  }

  return profile;
};

export const updateStudentProfile = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid student profile id", 400);
  }

  const updatePayload = buildUpdatePayload(payload);

  if (updatePayload.studentId) {
    const duplicateProfile = await StudentProfile.findOne({
      studentId: updatePayload.studentId,
      _id: { $ne: id },
    });

    if (duplicateProfile) {
      throw new AppError("Student ID already exists", 409);
    }
  }

  const updatedProfile = await StudentProfile.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate("user", "name email role");

  if (!updatedProfile) {
    throw new AppError("Student profile not found", 404);
  }

  return updatedProfile;
};

export const deleteStudentProfile = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid student profile id", 400);
  }

  const deletedProfile = await StudentProfile.findByIdAndDelete(id);

  if (!deletedProfile) {
    throw new AppError("Student profile not found", 404);
  }

  return deletedProfile;
};
