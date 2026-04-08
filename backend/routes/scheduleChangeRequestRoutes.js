import { Router } from "express";

import {
  fileChangeRequestController,
  getLecturerRequestsController,
  getAllRequestsController,
  approveRequestController,
  rejectRequestController,
} from "../controllers/scheduleChangeRequest.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";

const router = Router();

// Lecturer routes
router.post("/", protect, lecturerMiddleware, fileChangeRequestController);
router.get("/my-requests", protect, lecturerMiddleware, getLecturerRequestsController);

// Admin routes
router.get("/", protect, adminMiddleware, getAllRequestsController);
router.put("/:id/approve", protect, adminMiddleware, approveRequestController);
router.put("/:id/reject", protect, adminMiddleware, rejectRequestController);

export default router;
