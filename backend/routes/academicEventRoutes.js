import { Router } from "express";

import {
  createAcademicEventController,
  deleteAcademicEventController,
  getAcademicEventByIdController,
  getAllAcademicEventsController,
  updateAcademicEventController,
} from "../controllers/academicEvent.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.post("/", validate(), createAcademicEventController);
router.get("/", getAllAcademicEventsController);
router.get("/:id", getAcademicEventByIdController);
router.put("/:id", validate(), updateAcademicEventController);
router.delete("/:id", deleteAcademicEventController);

export default router;
