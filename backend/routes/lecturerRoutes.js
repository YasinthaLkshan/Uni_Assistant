import { Router } from "express";

import {
  getDashboardController,
  getMyTimetableController,
  getNoticesController,
} from "../controllers/lecturer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";

const router = Router();

router.use(protect, lecturerMiddleware);

router.get("/dashboard", getDashboardController);
router.get("/my-timetable", getMyTimetableController);
router.get("/notices", getNoticesController);

export default router;
