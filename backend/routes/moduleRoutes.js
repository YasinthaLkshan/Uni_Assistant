import { Router } from "express";

import {
  createModuleController,
  deleteModuleController,
  filterModulesBySemesterController,
  getAllModulesController,
  getModuleByIdController,
  updateModuleController,
} from "../controllers/module.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.post("/", validate(), createModuleController);
router.get("/", getAllModulesController);
router.get("/semester/:semester", filterModulesBySemesterController);
router.get("/:id", getModuleByIdController);
router.put("/:id", validate(), updateModuleController);
router.delete("/:id", deleteModuleController);

export default router;
