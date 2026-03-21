import mongoose from "mongoose";

import Task from "../models/Task.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const calculateUrgencyLevel = (deadline) => {
  const now = new Date();
  const dueDate = new Date(deadline);
  const msUntilDeadline = dueDate.getTime() - now.getTime();
  const daysUntilDeadline = msUntilDeadline / (1000 * 60 * 60 * 24);

  if (daysUntilDeadline <= 2) {
    return "High";
  }

  if (daysUntilDeadline <= 5) {
    return "Medium";
  }

  return "Low";
};

const validateTaskPayload = ({ title, type, deadline }) => {
  if (!title || !type || !deadline) {
    throw new AppError("title, type, and deadline are required", 400);
  }

  const parsedDeadline = new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) {
    throw new AppError("deadline must be a valid date", 400);
  }
};

export const createTask = asyncHandler(async (req, res) => {
  const { title, type, deadline, priority, status, description } = req.body;

  validateTaskPayload({ title, type, deadline });

  const task = await Task.create({
    user: req.user._id,
    title,
    type,
    deadline,
    priority,
    status,
    description,
    urgencyLevel: calculateUrgencyLevel(deadline),
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});

export const getUserTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ deadline: 1 });

  res.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    data: tasks,
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOne({ _id: id, user: req.user._id });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task fetched successfully",
    data: task,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOne({ _id: id, user: req.user._id });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const allowedUpdates = ["title", "type", "deadline", "priority", "status", "description"];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  if (!task.title || !task.type || !task.deadline) {
    throw new AppError("title, type, and deadline are required", 400);
  }

  const parsedDeadline = new Date(task.deadline);
  if (Number.isNaN(parsedDeadline.getTime())) {
    throw new AppError("deadline must be a valid date", 400);
  }

  task.urgencyLevel = calculateUrgencyLevel(task.deadline);

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});
