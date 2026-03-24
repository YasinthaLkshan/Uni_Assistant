import { Router } from "express";

import {
  createStudentProfileController,
  deleteStudentProfileController,
  getAllStudentProfilesController,
  getStudentProfileByIdController,
  updateStudentProfileController,
} from "../controllers/studentProfile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.post("/", validate(), createStudentProfileController);
router.get("/", getAllStudentProfilesController);
router.get("/:id", getStudentProfileByIdController);
router.put("/:id", validate(), updateStudentProfileController);
router.delete("/:id", deleteStudentProfileController);

export default router;
