import AcademicEvent from "../models/AcademicEvent.js";
import Coursework from "../models/Coursework.js";
import ExamPaper from "../models/ExamPaper.js";
import LectureSchedule from "../models/LectureSchedule.js";
import Material from "../models/Material.js";
import Module from "../models/Module.js";
import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import StudentProfile from "../models/StudentProfile.js";
import TimetableEntry from "../models/TimetableEntry.js";
import VivaSchedule from "../models/VivaSchedule.js";
import AppError from "../utils/appError.js";
import fs from "fs";

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const mapModuleFields = (mod) => ({
  ...mod,
  title: mod.moduleName || mod.title || "",
  groups: mod.groups || [1, 2, 3],
  credits: mod.credits || 3,
});

export const resolveLecturerModules = async (userId) => {
  const modules = await Module.find({
    $or: [
      { lecturer: userId },
      { "lecturerAssignments.lecturer": userId },
    ],
  })
    .populate("programme", "programmeCode programmeName programmeType duration groups")
    .sort({ semester: 1, moduleCode: 1 })
    .lean();

  return modules.map((mod) => {
    const mapped = mapModuleFields(mod);

    // Determine which groups this lecturer is assigned to
    const assignedGroups = (mod.lecturerAssignments || [])
      .filter((a) => String(a.lecturer) === String(userId))
      .map((a) => a.group);

    if (assignedGroups.length > 0) {
      mapped.assignedGroups = assignedGroups;
    } else {
      mapped.assignedGroups = mapped.groups;
    }

    return mapped;
  });
};

export const verifyModuleOwnership = async (userId, moduleCode) => {
  const mod = await Module.findOne({
    moduleCode: moduleCode.trim().toUpperCase(),
    $or: [
      { lecturer: userId },
      { "lecturerAssignments.lecturer": userId },
    ],
  }).lean();

  if (!mod) {
    throw new AppError("You are not assigned to this module", 403);
  }

  return mapModuleFields(mod);
};

export const getLecturerDashboard = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);
  const moduleIds = modules.map((m) => m._id);

  const now = new Date();

  const [
    totalEvents,
    upcomingEvents,
    totalStudents,
    draftSessions,
    pendingChangeRequests,
    pendingVivas,
    pendingExamPapers,
  ] = await Promise.all([
    AcademicEvent.countDocuments({ moduleCode: { $in: moduleCodes } }),
    AcademicEvent.countDocuments({
      moduleCode: { $in: moduleCodes },
      eventDate: { $gte: now },
    }),
    (async () => {
      const semesterGroups = modules.flatMap((m) =>
        m.groups.map((g) => ({ semester: m.semester, groupNumber: g }))
      );

      if (semesterGroups.length === 0) return 0;

      return StudentProfile.countDocuments({
        $or: semesterGroups,
      });
    })(),
    LectureSchedule.countDocuments({ lecturer: userId, status: "draft" }),
    ScheduleChangeRequest.countDocuments({ lecturer: userId, status: "pending" }),
    VivaSchedule.countDocuments({ lecturer: userId, status: "proposed" }),
    ExamPaper.countDocuments({ lecturer: userId, status: "Pending" }),
  ]);

  // Find modules that have no submitted schedule at all
  const scheduledModuleGroups = await LectureSchedule.distinct("module", {
    lecturer: userId,
    status: { $in: ["draft", "submitted"] },
  });
  const scheduledModuleIdSet = new Set(scheduledModuleGroups.map((id) => String(id)));
  const unscheduledModules = modules.filter((m) => !scheduledModuleIdSet.has(String(m._id)));

  return {
    modules: modules.length,
    totalEvents,
    upcomingEvents,
    totalStudents,
    pendingTasks: {
      draftSessions,
      pendingChangeRequests,
      pendingVivas,
      pendingExamPapers,
      unscheduledModules: unscheduledModules.length,
      unscheduledModuleList: unscheduledModules.map((m) => ({
        _id: m._id,
        moduleCode: m.moduleCode,
        title: m.title || m.moduleName,
      })),
    },
  };
};

export const getLecturerModules = async (userId) => {
  return resolveLecturerModules(userId);
};

export const getLecturerEvents = async (userId, filters = {}) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const query = { moduleCode: { $in: moduleCodes } };

  if (filters.semester) {
    query.semester = Number(filters.semester);
  }

  if (filters.groupNumber) {
    query.groupNumber = Number(filters.groupNumber);
  }

  if (filters.moduleCode) {
    query.moduleCode = filters.moduleCode.trim().toUpperCase();
  }

  const events = await AcademicEvent.find(query)
    .populate("module")
    .sort({ eventDate: 1, startTime: 1, createdAt: -1 })
    .lean();

  return events;
};

export const createLecturerEvent = async (userId, payload) => {
  const { moduleCode } = payload;

  if (!moduleCode) {
    throw new AppError("moduleCode is required", 400);
  }

  await verifyModuleOwnership(userId, moduleCode);

  const event = await AcademicEvent.create(payload);
  return event;
};

export const updateLecturerEvent = async (userId, eventId, payload) => {
  const event = await AcademicEvent.findById(eventId);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  await verifyModuleOwnership(userId, event.moduleCode);

  if (payload.moduleCode && payload.moduleCode !== event.moduleCode) {
    await verifyModuleOwnership(userId, payload.moduleCode);
  }

  Object.assign(event, payload);
  await event.save();

  return event;
};

export const deleteLecturerEvent = async (userId, eventId) => {
  const event = await AcademicEvent.findById(eventId);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  await verifyModuleOwnership(userId, event.moduleCode);

  await AcademicEvent.findByIdAndDelete(eventId);
};

export const getLecturerTimetable = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const entries = await TimetableEntry.find({
    moduleCode: { $in: moduleCodes },
  })
    .populate("module")
    .lean();

  return [...entries].sort((a, b) => {
    const dayCompare =
      (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayCompare !== 0) return dayCompare;
    return String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });
};

export const getLecturerStudents = async (userId, filters = {}) => {
  const modules = await resolveLecturerModules(userId);

  let filteredModules = modules;
  if (filters.moduleCode) {
    filteredModules = modules.filter(
      (m) => m.moduleCode === filters.moduleCode.trim().toUpperCase()
    );
  }

  const semesterGroups = filteredModules.flatMap((m) =>
    m.groups.map((g) => ({ semester: m.semester, groupNumber: g }))
  );

  if (semesterGroups.length === 0) return [];

  const students = await StudentProfile.find({
    $or: semesterGroups,
  })
    .sort({ fullName: 1 })
    .lean();

  return students;
};

// ─── Helper: format file size ────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

// ─── Materials ───────────────────────────────────────────────────────────────

export const getLecturerMaterials = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  return Material.find({ moduleCode: { $in: moduleCodes }, lecturer: userId })
    .sort({ createdAt: -1 })
    .lean();
};

export const createLecturerMaterial = async (userId, payload, file) => {
  const { moduleCode } = payload;
  if (!moduleCode) throw new AppError("moduleCode is required", 400);

  const mod = await verifyModuleOwnership(userId, moduleCode);

  const material = await Material.create({
    ...payload,
    lecturer: userId,
    moduleName: mod.title || mod.moduleName || "",
    fileName: file?.originalname || "",
    fileSize: formatFileSize(file?.size),
    filePath: file?.path || "",
  });

  return material;
};

export const updateLecturerMaterial = async (userId, id, payload, file) => {
  const material = await Material.findById(id);
  if (!material) throw new AppError("Material not found", 404);
  if (String(material.lecturer) !== String(userId))
    throw new AppError("Not authorized", 403);

  await verifyModuleOwnership(userId, material.moduleCode);

  if (payload.moduleCode && payload.moduleCode !== material.moduleCode) {
    const mod = await verifyModuleOwnership(userId, payload.moduleCode);
    payload.moduleName = mod.title || mod.moduleName || "";
  }

  if (file) {
    if (material.filePath) {
      try { fs.unlinkSync(material.filePath); } catch { /* ignore */ }
    }
    payload.fileName = file.originalname;
    payload.fileSize = formatFileSize(file.size);
    payload.filePath = file.path;
  }

  Object.assign(material, payload);
  await material.save();
  return material;
};

export const deleteLecturerMaterial = async (userId, id) => {
  const material = await Material.findById(id);
  if (!material) throw new AppError("Material not found", 404);
  if (String(material.lecturer) !== String(userId))
    throw new AppError("Not authorized", 403);

  if (material.filePath) {
    try { fs.unlinkSync(material.filePath); } catch { /* ignore */ }
  }

  await Material.findByIdAndDelete(id);
};

// ─── Exam Papers ─────────────────────────────────────────────────────────────

export const getLecturerExamPapers = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  return ExamPaper.find({ moduleCode: { $in: moduleCodes }, lecturer: userId })
    .sort({ createdAt: -1 })
    .lean();
};

export const createLecturerExamPaper = async (userId, payload, file) => {
  const { moduleCode } = payload;
  if (!moduleCode) throw new AppError("moduleCode is required", 400);

  const mod = await verifyModuleOwnership(userId, moduleCode);

  if (typeof payload.groups === "string") {
    payload.groups = JSON.parse(payload.groups);
  }

  const exam = await ExamPaper.create({
    ...payload,
    lecturer: userId,
    moduleName: mod.title || mod.moduleName || "",
    status: "Pending",
    fileName: file?.originalname || "",
    fileSize: formatFileSize(file?.size),
    filePath: file?.path || "",
  });

  return exam;
};

export const updateLecturerExamPaper = async (userId, id, payload, file) => {
  const exam = await ExamPaper.findById(id);
  if (!exam) throw new AppError("Exam paper not found", 404);
  if (String(exam.lecturer) !== String(userId))
    throw new AppError("Not authorized", 403);
  if (exam.status !== "Pending")
    throw new AppError("Cannot edit a non-pending exam paper", 400);

  await verifyModuleOwnership(userId, exam.moduleCode);

  if (payload.moduleCode && payload.moduleCode !== exam.moduleCode) {
    const mod = await verifyModuleOwnership(userId, payload.moduleCode);
    payload.moduleName = mod.title || mod.moduleName || "";
  }

  if (typeof payload.groups === "string") {
    payload.groups = JSON.parse(payload.groups);
  }

  if (file) {
    if (exam.filePath) {
      try { fs.unlinkSync(exam.filePath); } catch { /* ignore */ }
    }
    payload.fileName = file.originalname;
    payload.fileSize = formatFileSize(file.size);
    payload.filePath = file.path;
  }

  payload.status = "Pending";
  Object.assign(exam, payload);
  await exam.save();
  return exam;
};

export const deleteLecturerExamPaper = async (userId, id) => {
  const exam = await ExamPaper.findById(id);
  if (!exam) throw new AppError("Exam paper not found", 404);
  if (String(exam.lecturer) !== String(userId))
    throw new AppError("Not authorized", 403);
  if (exam.status !== "Pending")
    throw new AppError("Cannot delete a non-pending exam paper", 400);

  if (exam.filePath) {
    try { fs.unlinkSync(exam.filePath); } catch { /* ignore */ }
  }

  await ExamPaper.findByIdAndDelete(id);
};

// ─── Coursework ──────────────────────────────────────────────────────────────

export const getLecturerCoursework = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  return Coursework.find({ moduleCode: { $in: moduleCodes }, lecturer: userId })
    .sort({ createdAt: -1 })
    .lean();
};

export const createLecturerCoursework = async (userId, payload, file) => {
  const { moduleCode } = payload;
  if (!moduleCode) throw new AppError("moduleCode is required", 400);

  const mod = await verifyModuleOwnership(userId, moduleCode);

  const coursework = await Coursework.create({
    ...payload,
    lecturer: userId,
    moduleName: mod.title || mod.moduleName || "",
    status: "Pending",
    fileName: file?.originalname || "",
    fileSize: formatFileSize(file?.size),
    filePath: file?.path || "",
  });

  return coursework;
};

export const updateLecturerCoursework = async (userId, id, payload, file) => {
  const cw = await Coursework.findById(id);
  if (!cw) throw new AppError("Coursework not found", 404);
  if (String(cw.lecturer) !== String(userId))
    throw new AppError("Not authorized", 403);
  if (cw.status !== "Pending")
    throw new AppError("Cannot edit a non-pending coursework", 400);

  await verifyModuleOwnership(userId, cw.moduleCode);

  if (payload.moduleCode && payload.moduleCode !== cw.moduleCode) {
    const mod = await verifyModuleOwnership(userId, payload.moduleCode);
    payload.moduleName = mod.title || mod.moduleName || "";
  }

  if (file) {
    if (cw.filePath) {
      try { fs.unlinkSync(cw.filePath); } catch { /* ignore */ }
    }
    payload.fileName = file.originalname;
    payload.fileSize = formatFileSize(file.size);
    payload.filePath = file.path;
  }

  payload.status = "Pending";
  Object.assign(cw, payload);
  await cw.save();
  return cw;
};

export const deleteLecturerCoursework = async (userId, id) => {
  const cw = await Coursework.findById(id);
  if (!cw) throw new AppError("Coursework not found", 404);
  if (String(cw.lecturer) !== String(userId))
    throw new AppError("Not authorized", 403);
  if (cw.status !== "Pending")
    throw new AppError("Cannot delete a non-pending coursework", 400);

  if (cw.filePath) {
    try { fs.unlinkSync(cw.filePath); } catch { /* ignore */ }
  }

  await Coursework.findByIdAndDelete(id);
};
