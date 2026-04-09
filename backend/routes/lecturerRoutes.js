import { Router } from "express";

import {
  getDashboardController,
  getMyModulesController,
  getMyEventsController,
  createEventController,
  updateEventController,
  deleteEventController,
  getMyTimetableController,
  getMyStudentsController,
  getMaterialsController,
  createMaterialController,
  updateMaterialController,
  deleteMaterialController,
  getExamPapersController,
  createExamPaperController,
  updateExamPaperController,
  deleteExamPaperController,
  getCourseworkController,
  createCourseworkController,
  updateCourseworkController,
  deleteCourseworkController,
} from "../controllers/lecturer.controller.js";
import {
  getScheduleSummaryController,
  getModuleScheduleController,
  getFullScheduleController,
  addSessionsController,
  removeSessionController,
  submitScheduleController,
} from "../controllers/lectureSchedule.controller.js";
import {
  getPossibleExamDatesController,
  validateExamDateController,
} from "../controllers/examSchedule.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";
import {
  uploadMaterial,
  uploadExamPaper,
  uploadCoursework,
} from "../middleware/upload.middleware.js";

const router = Router();

router.use(protect, lecturerMiddleware);

router.get("/dashboard", getDashboardController);
router.get("/my-modules", getMyModulesController);
router.get("/my-events", getMyEventsController);
router.post("/events", createEventController);
router.put("/events/:id", updateEventController);
router.delete("/events/:id", deleteEventController);
router.get("/my-timetable", getMyTimetableController);
router.get("/my-students", getMyStudentsController);

// Materials
router.get("/materials", getMaterialsController);
router.post("/materials", uploadMaterial, createMaterialController);
router.put("/materials/:id", uploadMaterial, updateMaterialController);
router.delete("/materials/:id", deleteMaterialController);

// Exam Papers
router.get("/exams", getExamPapersController);
router.post("/exams", uploadExamPaper, createExamPaperController);
router.put("/exams/:id", uploadExamPaper, updateExamPaperController);
router.delete("/exams/:id", deleteExamPaperController);

// Exam Scheduling
router.get("/exam-schedule/:moduleId/:group/possible-dates", getPossibleExamDatesController);
router.post("/exam-schedule/:moduleId/:group/validate-date", validateExamDateController);

// Coursework
router.get("/coursework", getCourseworkController);
router.post("/coursework", uploadCoursework, createCourseworkController);
router.put("/coursework/:id", uploadCoursework, updateCourseworkController);
router.delete("/coursework/:id", deleteCourseworkController);

// Lecture Scheduling
router.get("/schedule", getFullScheduleController);
router.get("/schedule/:moduleId/:group", getModuleScheduleController);
router.get("/schedule/:moduleId/:group/summary", getScheduleSummaryController);
router.post("/schedule/:moduleId/:group", addSessionsController);
router.post("/schedule/:moduleId/:group/submit", submitScheduleController);
router.delete("/schedule/session/:sessionId", removeSessionController);

export default router;
