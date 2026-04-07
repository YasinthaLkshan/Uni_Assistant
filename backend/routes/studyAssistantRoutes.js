import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import studentMiddleware from "../middleware/student.middleware.js";
import {
  getTodaysLecturesController,
  getExamCountdownController,
  markAttendanceController,
  getAttendanceSummaryController,
  getMissedLecturesController,
  getPendingMaterialsController,
  markMaterialViewedController,
  getStudyStrategyController,
  getStudyAssistantDashboardController,
  getStudyNotificationsController,
  markNotificationsReadController,
} from "../controllers/studyAssistant.controller.js";

const router = Router();

router.use(protect, studentMiddleware);

// Aggregated dashboard
router.get("/dashboard", getStudyAssistantDashboardController);

// Phase 1
router.get("/todays-lectures", getTodaysLecturesController);
router.get("/exam-countdown", getExamCountdownController);

// Phase 2
router.post("/attendance", markAttendanceController);
router.get("/attendance", getAttendanceSummaryController);
router.get("/missed-lectures", getMissedLecturesController);

// Phase 3
router.get("/pending-materials", getPendingMaterialsController);
router.post("/material-viewed", markMaterialViewedController);

// Phase 4
router.get("/study-strategy", getStudyStrategyController);

// Phase 5
router.get("/notifications", getStudyNotificationsController);
router.post("/notifications/mark-read", markNotificationsReadController);

export default router;
