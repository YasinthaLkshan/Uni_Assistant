import mongoose from "mongoose";

import Task from "../models/Task.js";
import AppError from "../utils/appError.js";

const TYPE_PRIORITY = {
  exam: 1,
  assignment: 2,
  presentation: 3,
};

const URGENCY_PRIORITY = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const SIMILAR_DEADLINE_WINDOW_MS = 24 * 60 * 60 * 1000;

const getTypePriority = (type) => TYPE_PRIORITY[type] ?? 99;
const getUrgencyPriority = (urgencyLevel) => URGENCY_PRIORITY[urgencyLevel] ?? 0;

const compareTasks = (a, b) => {
  const typePriorityDiff = getTypePriority(a.type) - getTypePriority(b.type);
  if (typePriorityDiff !== 0) {
    return typePriorityDiff;
  }

  const deadlineA = new Date(a.deadline).getTime();
  const deadlineB = new Date(b.deadline).getTime();
  const deadlineDiff = deadlineA - deadlineB;

  if (Math.abs(deadlineDiff) > SIMILAR_DEADLINE_WINDOW_MS) {
    return deadlineDiff;
  }

  const urgencyDiff = getUrgencyPriority(b.urgencyLevel) - getUrgencyPriority(a.urgencyLevel);
  if (urgencyDiff !== 0) {
    return urgencyDiff;
  }

  return deadlineDiff;
};

export const getBestTaskRecommendation = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError("A valid user id is required", 400);
  }

  const now = new Date();

  const activeTasks = await Task.find({
    user: userId,
    status: { $ne: "Completed" },
    deadline: { $gt: now }, // Filter out tasks with past deadlines
  })
    .select("title type urgencyLevel deadline")
    .lean();

  if (!activeTasks.length) {
    return {
      taskId: null,
      title: null,
      type: null,
      urgencyLevel: null,
      deadline: null,
      message: "No active tasks available",
    };
  }

  const [recommendedTask] = activeTasks.sort(compareTasks);

  return {
    taskId: recommendedTask._id,
    title: recommendedTask.title,
    type: recommendedTask.type,
    urgencyLevel: recommendedTask.urgencyLevel,
    deadline: recommendedTask.deadline,
    message: "Focus on this task first",
  };
};
