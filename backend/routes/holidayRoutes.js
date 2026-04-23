import { Router } from "express";

import {
  createHolidayController,
  deleteHolidayController,
  getAllHolidaysController,
  getHolidayByIdController,
  getHolidaysInRangeController,
  updateHolidayController,
} from "../controllers/holiday.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

// Public read routes (lecturers need to fetch holidays for scheduling)
router.get("/", protect, getAllHolidaysController);
router.get("/range", protect, getHolidaysInRangeController);
router.get("/:id", protect, getHolidayByIdController);

// Admin-only write routes
router.post("/", protect, adminMiddleware, validate(), createHolidayController);
router.put("/:id", protect, adminMiddleware, validate(), updateHolidayController);
router.delete("/:id", protect, adminMiddleware, deleteHolidayController);

export default router;
