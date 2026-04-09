import { Router } from "express";

import {
  proposeVivaController,
  getLecturerVivasController,
  deleteVivaController,
  getAllVivasController,
  approveVivaController,
  rejectVivaController,
} from "../controllers/vivaSchedule.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import lecturerMiddleware from "../middleware/lecturer.middleware.js";

const router = Router();

// Lecturer routes
router.post("/", protect, lecturerMiddleware, proposeVivaController);
router.get("/my-vivas", protect, lecturerMiddleware, getLecturerVivasController);
router.delete("/:id", protect, lecturerMiddleware, deleteVivaController);

// Admin routes
router.get("/", protect, adminMiddleware, getAllVivasController);
router.put("/:id/approve", protect, adminMiddleware, approveVivaController);
router.put("/:id/reject", protect, adminMiddleware, rejectVivaController);

export default router;
