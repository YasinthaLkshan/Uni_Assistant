import { Router } from "express";

import {
  getDashboardController,
  getSessionsController,
  getSessionStudentsController,
  markAttendanceController,
} from "../controllers/performanceInsights.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";

const router = Router();

router.use(protect, lecturerMiddleware);

router.get("/dashboard", getDashboardController);
router.get("/sessions", getSessionsController);
router.get("/sessions/:entryId/:date", getSessionStudentsController);
router.post("/attendance/mark", markAttendanceController);

export default router;
