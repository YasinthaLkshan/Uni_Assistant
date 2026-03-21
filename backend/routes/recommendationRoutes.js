import { Router } from "express";

import { getRecommendation } from "../controllers/recommendationController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/", getRecommendation);

export default router;
