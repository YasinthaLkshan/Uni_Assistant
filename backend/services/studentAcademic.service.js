import AcademicEvent from "../models/AcademicEvent.js";
import Module from "../models/Module.js";
import StudentProfile from "../models/StudentProfile.js";
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

export const resolveStudentScope = async (user) => {
  const profile = await StudentProfile.findOne({
    $or: [{ user: user._id }, { studentId: user.studentId }],
  })
    .select("semester groupNumber faculty academicYear")
    .lean();

  const semester = user.semester ?? profile?.semester;
  const groupNumber = user.groupNumber ?? profile?.groupNumber;
  const faculty = user.faculty ?? profile?.faculty ?? "IT";
  const academicYear = user.academicYear ?? profile?.academicYear ?? 3;

  if (!semester || !groupNumber) {
    throw new AppError("Student semester/group information is not available. Please contact admin.", 400);
  }

  return {
    semester: Number(semester),
    groupNumber: Number(groupNumber),
    faculty: String(faculty).trim().toUpperCase(),
    academicYear: Number(academicYear),
  };
};

export const scopeQuery = (scope, includeGroup = true) => {
  const query = {
    faculty: scope.faculty,
    $or: [{ academicYear: scope.academicYear }, { year: scope.academicYear }],
    semester: scope.semester,
  };

  if (includeGroup) {
    query.groupNumber = scope.groupNumber;
  }

  return query;
};

const sortTimetable = (rows) => {
  return [...rows].sort((a, b) => {
    const dayCompare = (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayCompare !== 0) {
      return dayCompare;
    }

    return String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });
};

export const getMyModules = async (user) => {
  const scope = await resolveStudentScope(user);

  const modules = await Module.find(scopeQuery(scope, false))
    .sort({ moduleCode: 1 })
    .lean();

  return { scope, items: modules };
};

export const getMyTimetable = async (user) => {
  const scope = await resolveStudentScope(user);

  const entries = await TimetableEntry.find(scopeQuery(scope, true))
    .populate("module")
    .lean();

  return { scope, items: sortTimetable(entries) };
};

export const getMyEvents = async (user) => {
  const scope = await resolveStudentScope(user);

  const events = await AcademicEvent.find(scopeQuery(scope, true))
    .populate("module")
    .sort({ eventDate: 1, startTime: 1, createdAt: -1 })
    .lean();

  return { scope, items: events };
};
