import { Router } from "express";

import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import taskRoutes from "./taskRoutes.js";
import workloadRoutes from "./workloadRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/recommendation", recommendationRoutes);
router.use("/tasks", taskRoutes);
router.use("/workload", workloadRoutes);

export default router;
