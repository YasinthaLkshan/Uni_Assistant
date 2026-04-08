import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import WorkloadReport from "../models/WorkloadReport.js";
import { getBestTaskRecommendation } from "../services/recommendationService.js";
import { generateEnhancedWorkloadReportForUser } from "../services/workloadService.js";
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

const buildWorkloadSummary = (enhancedAnalysis) => {
  if (!enhancedAnalysis) {
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

  const { metrics, workloadAnalysis, studySuggestion } = enhancedAnalysis;

  return {
    workloadScore: metrics.workloadScore,
    workloadLevel: workloadAnalysis.level,
    studySuggestion,
    breakdown: {
      totalTasks: metrics.totalEvents,
      urgentTasks: metrics.criticalEvents + metrics.highUrgencyEvents,
      examsNear: metrics.criticalEvents,
    },
    analysis: {
      intensity: workloadAnalysis.intensity,
      recommendation: workloadAnalysis.recommendation,
      complexity: metrics.complexity,
    },
  };
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const { start, end } = getTodayRange();

  // Calculate date range for preparation tasks (next 7 days or until nearest event)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayTasks, upcomingTasksCount, enhancedWorkloadAnalysis, unreadNotificationCount, upcomingTasks] =
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
        deadline: { $gt: now },
      }),
      generateEnhancedWorkloadReportForUser(userId).catch(() => null),
      Notification.countDocuments({ user: userId, isRead: false }),
      // Fetch preparation tasks: urgent tasks within 7 days or until nearest event
      Task.find({
        user: userId,
        status: { $ne: "Completed" },
        deadline: { $gt: now, $lte: sevenDaysFromNow },
        urgencyLevel: { $in: ["High", "Medium"] },
      })
        .sort({ deadline: 1 })
        .limit(5)
        .lean(),
    ]);

  // Build smart recommendation from most urgent event
  let smartRecommendation = {
    taskId: null,
    title: "No recommendation yet",
    type: "general",
    urgencyLevel: "Low",
    deadline: null,
    daysLeft: null,
    message: "Create tasks to receive a smart recommendation.",
  };

  if (enhancedWorkloadAnalysis?.mostUrgentEvent) {
    const event = enhancedWorkloadAnalysis.mostUrgentEvent;
    smartRecommendation = {
      taskId: event.taskId,
      title: event.title,
      type: event.type,
      urgencyLevel: event.urgencyLevel,
      deadline: event.deadline,
      daysLeft: event.daysLeft,
      message: `${event.daysLeft} day(s) until ${event.type}. Start preparation now.`,
    };
  }

  // Determine which tasks to display
  // If there are tasks due today, show them; otherwise show preparation tasks
  const displayTasks = todayTasks.length > 0 ? todayTasks : upcomingTasks;

  res.status(200).json({
    success: true,
    message: "Dashboard summary fetched successfully",
    data: {
      todaysTasks: displayTasks,
      todaysCount: todayTasks.length,
      upcomingTasksCount,
      workloadSummary: buildWorkloadSummary(enhancedWorkloadAnalysis),
      smartRecommendation,
      unreadNotificationCount,
    },
  });
});
