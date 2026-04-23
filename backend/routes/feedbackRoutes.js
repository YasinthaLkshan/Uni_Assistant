import { Router } from "express";

import {
  submitFeedbackController,
  getMyFeedbackController,
  getModulesForFeedbackController,
  getLecturerFeedbackSummaryController,
  getLecturerModuleFeedbackController,
} from "../controllers/feedback.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import studentMiddleware from "../middleware/student.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";

const router = Router();

// ─── Student Routes ──────────────────────────────────────────────────────────
router.post("/submit", protect, studentMiddleware, submitFeedbackController);
router.get("/my", protect, studentMiddleware, getMyFeedbackController);
router.get("/modules", protect, studentMiddleware, getModulesForFeedbackController);

// ─── Lecturer Routes ─────────────────────────────────────────────────────────
router.get("/summary", protect, lecturerMiddleware, getLecturerFeedbackSummaryController);
router.get("/module/:moduleCode", protect, lecturerMiddleware, getLecturerModuleFeedbackController);

export default router;
