import WorkloadReport from "../models/WorkloadReport.js";
import { generateWorkloadReportForUser } from "../services/workloadService.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { getStudySuggestion } from "../utils/workloadUtils.js";

const formatWorkloadPayload = (report, studySuggestion) => ({
  workloadScore: report.workloadScore,
  workloadLevel: report.workloadLevel,
  studySuggestion,
  breakdown: {
    totalTasks: report.totalTasks,
    urgentTasks: report.urgentTasks,
    examsNear: report.examsNear,
  },
});

export const generateWorkloadReport = asyncHandler(async (req, res) => {
  const { report, studySuggestion } = await generateWorkloadReportForUser(req.user._id);

  res.status(200).json({
    success: true,
    message: "Workload report generated successfully",
    data: formatWorkloadPayload(report, studySuggestion),
  });
});

export const getLatestWorkload = asyncHandler(async (req, res) => {
  const latestReport = await WorkloadReport.findOne({ user: req.user._id }).sort({
    calculatedAt: -1,
    createdAt: -1,
  });

  if (!latestReport) {
    throw new AppError("No workload report found for this user", 404);
  }

  const studySuggestion = getStudySuggestion(latestReport.workloadLevel);

  res.status(200).json({
    success: true,
    message: "Latest workload report fetched successfully",
    data: formatWorkloadPayload(latestReport, studySuggestion),
  });
});
