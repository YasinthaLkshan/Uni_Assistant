import { Router } from "express";

import {
  listLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer,
} from "../controllers/adminLecturer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.get("/", listLecturers);
router.post("/", createLecturer);
router.put("/:id", updateLecturer);
router.delete("/:id", deleteLecturer);

export default router;
