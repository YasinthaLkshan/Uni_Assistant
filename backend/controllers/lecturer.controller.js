import asyncHandler from "../utils/asyncHandler.js";
import {
  getLecturerDashboard,
  getLecturerModules,
  getLecturerEvents,
  createLecturerEvent,
  updateLecturerEvent,
  deleteLecturerEvent,
  getLecturerTimetable,
  getLecturerStudents,
  getLecturerMaterials,
  createLecturerMaterial,
  updateLecturerMaterial,
  deleteLecturerMaterial,
  getLecturerExamPapers,
  createLecturerExamPaper,
  updateLecturerExamPaper,
  deleteLecturerExamPaper,
  getLecturerCoursework,
  createLecturerCoursework,
  updateLecturerCoursework,
  deleteLecturerCoursework,
} from "../services/lecturer.service.js";

export const getDashboardController = asyncHandler(async (req, res) => {
  const data = await getLecturerDashboard(req.user._id);

  res.status(200).json({
    success: true,
    message: "Lecturer dashboard fetched successfully",
    data,
  });
});

export const getMyModulesController = asyncHandler(async (req, res) => {
  const modules = await getLecturerModules(req.user._id);

  res.status(200).json({
    success: true,
    message: "Lecturer modules fetched successfully",
    data: modules,
  });
});

export const getMyEventsController = asyncHandler(async (req, res) => {
  const events = await getLecturerEvents(req.user._id, req.query);

  res.status(200).json({
    success: true,
    message: "Lecturer events fetched successfully",
    data: events,
  });
});

export const createEventController = asyncHandler(async (req, res) => {
  const event = await createLecturerEvent(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

export const updateEventController = asyncHandler(async (req, res) => {
  const event = await updateLecturerEvent(
    req.user._id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
});

export const deleteEventController = asyncHandler(async (req, res) => {
  await deleteLecturerEvent(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

export const getMyTimetableController = asyncHandler(async (req, res) => {
  const timetable = await getLecturerTimetable(req.user._id);

  res.status(200).json({
    success: true,
    message: "Lecturer timetable fetched successfully",
    data: timetable,
  });
});

export const getMyStudentsController = asyncHandler(async (req, res) => {
  const students = await getLecturerStudents(req.user._id, req.query);

  res.status(200).json({
    success: true,
    message: "Lecturer students fetched successfully",
    data: students,
  });
});

// ─── Materials ───────────────────────────────────────────────────────────────

export const getMaterialsController = asyncHandler(async (req, res) => {
  const data = await getLecturerMaterials(req.user._id);
  res.status(200).json({ success: true, message: "Materials fetched successfully", data });
});

export const createMaterialController = asyncHandler(async (req, res) => {
  const data = await createLecturerMaterial(req.user._id, req.body, req.file);
  res.status(201).json({ success: true, message: "Material uploaded successfully", data });
});

export const updateMaterialController = asyncHandler(async (req, res) => {
  const data = await updateLecturerMaterial(req.user._id, req.params.id, req.body, req.file);
  res.status(200).json({ success: true, message: "Material updated successfully", data });
});

export const deleteMaterialController = asyncHandler(async (req, res) => {
  await deleteLecturerMaterial(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Material deleted successfully" });
});

// ─── Exam Papers ─────────────────────────────────────────────────────────────

export const getExamPapersController = asyncHandler(async (req, res) => {
  const data = await getLecturerExamPapers(req.user._id);
  res.status(200).json({ success: true, message: "Exam papers fetched successfully", data });
});

export const createExamPaperController = asyncHandler(async (req, res) => {
  const data = await createLecturerExamPaper(req.user._id, req.body, req.file);
  res.status(201).json({ success: true, message: "Exam paper submitted successfully", data });
});

export const updateExamPaperController = asyncHandler(async (req, res) => {
  const data = await updateLecturerExamPaper(req.user._id, req.params.id, req.body, req.file);
  res.status(200).json({ success: true, message: "Exam paper updated successfully", data });
});

export const deleteExamPaperController = asyncHandler(async (req, res) => {
  await deleteLecturerExamPaper(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Exam paper deleted successfully" });
});

// ─── Coursework ──────────────────────────────────────────────────────────────

export const getCourseworkController = asyncHandler(async (req, res) => {
  const data = await getLecturerCoursework(req.user._id);
  res.status(200).json({ success: true, message: "Coursework fetched successfully", data });
});

export const createCourseworkController = asyncHandler(async (req, res) => {
  const data = await createLecturerCoursework(req.user._id, req.body, req.file);
  res.status(201).json({ success: true, message: "Coursework uploaded successfully", data });
});

export const updateCourseworkController = asyncHandler(async (req, res) => {
  const data = await updateLecturerCoursework(req.user._id, req.params.id, req.body, req.file);
  res.status(200).json({ success: true, message: "Coursework updated successfully", data });
});

export const deleteCourseworkController = asyncHandler(async (req, res) => {
  await deleteLecturerCoursework(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Coursework deleted successfully" });
});
