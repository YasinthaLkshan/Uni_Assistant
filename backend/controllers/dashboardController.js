import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import WorkloadReport from "../models/WorkloadReport.js";
import { getBestTaskRecommendation } from "../services/recommendationService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getStudySuggestion } from "../utils/workloadUtils.js";

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const buildWorkloadSummary = (latestReport) => {
  if (!latestReport) {
    return {
      workloadScore: 0,
      workloadLevel: "Low",
      studySuggestion: getStudySuggestion("Low"),
      breakdown: {
        totalTasks: 0,
        urgentTasks: 0,
        examsNear: 0,
      },
    };
  }

  return {
    workloadScore: latestReport.workloadScore,
    workloadLevel: latestReport.workloadLevel,
    studySuggestion: getStudySuggestion(latestReport.workloadLevel),
    breakdown: {
      totalTasks: latestReport.totalTasks,
      urgentTasks: latestReport.urgentTasks,
      examsNear: latestReport.examsNear,
    },
  };
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const { start, end } = getTodayRange();

  const [todayTasks, upcomingTasksCount, latestWorkloadReport, smartRecommendation, unreadNotificationCount] =
    await Promise.all([
      Task.find({
        user: userId,
        status: { $ne: "Completed" },
        deadline: { $gte: start, $lte: end },
      })
        .sort({ deadline: 1 })
        .lean(),
      Task.countDocuments({
        user: userId,
        status: { $ne: "Completed" },
        deadline: { $gte: now },
      }),
      WorkloadReport.findOne({ user: userId }).sort({ calculatedAt: -1, createdAt: -1 }).lean(),
      getBestTaskRecommendation(userId),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

  res.status(200).json({
    success: true,
    message: "Dashboard summary fetched successfully",
    data: {
      todaysTasks: todayTasks,
      upcomingTasksCount,
      workloadSummary: buildWorkloadSummary(latestWorkloadReport),
      smartRecommendation,
      unreadNotificationCount,
    },
  });
});
