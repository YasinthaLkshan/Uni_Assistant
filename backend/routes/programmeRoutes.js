import { Router } from "express";

import {
  createProgrammeController,
  deleteProgrammeController,
  filterProgrammesByTypeController,
  getAllProgrammesController,
  getProgrammeByIdController,
  updateProgrammeController,
} from "../controllers/programme.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.post("/", validate(), createProgrammeController);
router.get("/", getAllProgrammesController);
router.get("/type/:type", filterProgrammesByTypeController);
router.get("/:id", getProgrammeByIdController);
router.put("/:id", validate(), updateProgrammeController);
router.delete("/:id", deleteProgrammeController);

export default router;
