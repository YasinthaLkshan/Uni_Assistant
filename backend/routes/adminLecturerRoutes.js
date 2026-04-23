import { Router } from "express";

import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(protect, adminMiddleware);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const lecturers = await User.find({ role: "lecturer" })
      .select("name email department")
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: lecturers });
  })
);

export default router;
