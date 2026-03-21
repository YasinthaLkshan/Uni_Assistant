import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import WorkloadReport from "../models/WorkloadReport.js";
import AppError from "../utils/appError.js";
import {
  calculateWorkloadScore,
  determineWorkloadLevel,
  getStudySuggestion,
} from "../utils/workloadUtils.js";

const NOTIFICATION_COOLDOWN_MINUTES = 180;
const EXAM_ALERT_WINDOW_DAYS = 2;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const createNotificationIfNotRecentDuplicate = async ({ userId, message, type }) => {
  const windowStart = new Date(Date.now() - NOTIFICATION_COOLDOWN_MINUTES * 60 * 1000);

  const existingNotification = await Notification.findOne({
    user: userId,
    message,
    createdAt: { $gte: windowStart },
  }).lean();

  if (existingNotification) {
    return null;
  }

  return Notification.create({
    user: userId,
    message,
    type,
  });
};

const countExamsWithinDays = (tasks, days) => {
  const now = new Date();

  return tasks.filter((task) => {
    if (task?.type !== "exam") {
      return false;
    }

    const deadline = new Date(task.deadline);
    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / DAY_IN_MS;
    return daysUntilDeadline >= 0 && daysUntilDeadline <= days;
  }).length;
};

export const generateWorkloadReportForUser = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError("A valid user id is required", 400);
  }

  // Active tasks are tasks that are not yet completed.
  const activeTasks = await Task.find({
    user: userId,
    status: { $ne: "Completed" },
  })
    .sort({ deadline: 1 })
    .lean();

  const scoreResult = calculateWorkloadScore(activeTasks);
  const levelResult = determineWorkloadLevel(scoreResult.score);
  const suggestion = getStudySuggestion(levelResult.level);
  const examsWithin2Days = countExamsWithinDays(activeTasks, EXAM_ALERT_WINDOW_DAYS);

  const report = await WorkloadReport.create({
    user: userId,
    workloadScore: scoreResult.score,
    workloadLevel: levelResult.level,
    totalTasks: scoreResult.breakdown.upcomingTasks,
    urgentTasks: scoreResult.breakdown.urgentTasks,
    examsNear: scoreResult.breakdown.examsWithin5Days,
    calculatedAt: new Date(),
  });

  const notificationsToCreate = [];

  if (levelResult.level === "High") {
    notificationsToCreate.push({
      userId,
      type: "workload",
      message: "Your workload is high. Prioritize your most critical tasks today.",
    });
  }

  if (scoreResult.breakdown.urgentTasks > 0) {
    notificationsToCreate.push({
      userId,
      type: "deadline",
      message: "You have urgent tasks pending. Focus on due-soon items first.",
    });
  }

  if (examsWithin2Days > 0) {
    notificationsToCreate.push({
      userId,
      type: "deadline",
      message: "An exam is within 2 days. Start focused revision now.",
    });
  }

  await Promise.all(
    notificationsToCreate.map((notification) =>
      createNotificationIfNotRecentDuplicate(notification)
    )
  );

  return {
    report,
    metrics: {
      activeTasks: activeTasks.length,
      upcomingTasks: scoreResult.breakdown.upcomingTasks,
      urgentTasks: scoreResult.breakdown.urgentTasks,
      examsWithin2Days,
      examsWithin5Days: scoreResult.breakdown.examsWithin5Days,
      workloadScore: scoreResult.score,
      workloadLevel: levelResult.level,
    },
    studySuggestion: suggestion,
  };
};
