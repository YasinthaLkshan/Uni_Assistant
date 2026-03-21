import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/summary", getDashboardSummary);

export default router;
