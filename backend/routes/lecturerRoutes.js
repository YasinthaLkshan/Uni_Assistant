import { Router } from "express";

import {
  getDashboardController,
  getMyTimetableController,
  getNoticesController,
  getAnnouncementsController,
  createAnnouncementController,
  deleteAnnouncementController,
  getMessagesController,
  sendMessageController,
  markMessageReadController,
  getAdminListController,
} from "../controllers/lecturer.controller.js";
import {
  getFullScheduleController,
  getModuleScheduleController,
  getScheduleSummaryController,
  addSessionsController,
  removeSessionController,
  submitScheduleController,
} from "../controllers/lectureSchedule.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";

const router = Router();

router.use(protect, lecturerMiddleware);

router.get("/dashboard", getDashboardController);
router.get("/my-timetable", getMyTimetableController);
router.get("/notices", getNoticesController);

// Announcements
router.get("/announcements", getAnnouncementsController);
router.post("/announcements", createAnnouncementController);
router.delete("/announcements/:id", deleteAnnouncementController);

// Messages
router.get("/messages", getMessagesController);
router.post("/messages", sendMessageController);
router.put("/messages/:id/read", markMessageReadController);

// Admin list (for contact admin feature)
router.get("/admins", getAdminListController);

// Lecture schedule
router.get("/schedule", getFullScheduleController);
router.get("/schedule/:moduleId/:group", getModuleScheduleController);
router.get("/schedule/:moduleId/:group/summary", getScheduleSummaryController);
router.post("/schedule/:moduleId/:group", addSessionsController);
router.post("/schedule/:moduleId/:group/submit", submitScheduleController);
router.delete("/schedule/session/:sessionId", removeSessionController);

export default router;
