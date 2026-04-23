import { Router } from "express";

import Programme from "../models/Programme.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(protect, adminMiddleware);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const programmes = await Programme.find({ isActive: true }).sort({ programmeCode: 1 });
    res.status(200).json({ success: true, data: programmes });
  })
);

export default router;
