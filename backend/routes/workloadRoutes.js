import { Router } from "express";

import {
  generateWorkloadReport,
  getLatestWorkload,
} from "../controllers/workloadController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", generateWorkloadReport);
router.get("/latest", getLatestWorkload);

export default router;
