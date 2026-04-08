import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import academicEventRoutes from "./routes/academicEventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminAcademicRoutes from "./routes/adminAcademicRoutes.js";
import adminLecturerRoutes from "./routes/adminLecturerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import lecturerRoutes from "./routes/lecturerRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import programmeRoutes from "./routes/programmeRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import scheduleChangeRequestRoutes from "./routes/scheduleChangeRequestRoutes.js";
import studentAcademicRoutes from "./routes/studentAcademicRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import workloadRoutes from "./routes/workloadRoutes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const defaultAllowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

const isAllowedDevOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    return isLocalHost && Boolean(parsed.port);
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Uni Assistant backend is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/academic", adminAcademicRoutes);
app.use("/api/admin/academic-events", academicEventRoutes);
app.use("/api/admin/modules", moduleRoutes);
app.use("/api/admin/programmes", programmeRoutes);
app.use("/api/admin/student-profiles", studentProfileRoutes);
app.use("/api/admin/timetable", timetableRoutes);
app.use("/api/schedule-change-requests", scheduleChangeRequestRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/workload", workloadRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/student", studentAcademicRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/admin/lecturers", adminLecturerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
