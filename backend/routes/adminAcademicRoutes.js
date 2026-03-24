import { Router } from "express";

import {
  createAcademicEntity,
  deleteAcademicEntity,
  getAcademicOverview,
  listAcademicEntity,
  updateAcademicEntity,
} from "../controllers/adminAcademicController.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.get("/overview", getAcademicOverview);
router.get("/:entity(student-profiles|modules|timetable|events)", listAcademicEntity);
router.post("/:entity(student-profiles|modules|timetable|events)", createAcademicEntity);
router.put("/:entity(student-profiles|modules|timetable|events)/:id", updateAcademicEntity);
router.delete("/:entity(student-profiles|modules|timetable|events)/:id", deleteAcademicEntity);

export default router;
