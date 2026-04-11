import { Router } from "express";

import academicEventRoutes from "./academicEventRoutes.js";
import authRoutes from "./authRoutes.js";
import adminAcademicRoutes from "./adminAcademicRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import moduleRoutes from "./moduleRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import studentAcademicRoutes from "./studentAcademicRoutes.js";
import studentProfileRoutes from "./studentProfileRoutes.js";
import taskRoutes from "./taskRoutes.js";
import timetableRoutes from "./timetableRoutes.js";
import workloadRoutes from "./workloadRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin/academic", adminAcademicRoutes);
router.use("/admin/academic-events", academicEventRoutes);
router.use("/admin/modules", moduleRoutes);
router.use("/admin/student-profiles", studentProfileRoutes);
router.use("/admin/timetable", timetableRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/recommendation", recommendationRoutes);
router.use("/student", studentAcademicRoutes);
router.use("/tasks", taskRoutes);
router.use("/workload", workloadRoutes);

export default router;
