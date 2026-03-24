import { Router } from "express";

import {
  getMyEventsController,
  getMyModulesController,
  getMyTimetableController,
} from "../controllers/studentAcademic.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import studentMiddleware from "../middleware/student.middleware.js";

const router = Router();

router.use(protect, studentMiddleware);

router.get("/my-modules", getMyModulesController);
router.get("/my-timetable", getMyTimetableController);
router.get("/my-events", getMyEventsController);

export default router;
