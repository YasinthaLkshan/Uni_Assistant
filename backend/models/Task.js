import mongoose from "mongoose";

const TASK_TYPES = ["assignment", "exam", "presentation"];
const PRIORITY_LEVELS = ["low", "medium", "high"];
const TASK_STATUS = ["Not Started", "In Progress", "Completed"];
const URGENCY_LEVELS = ["Low", "Medium", "High"];

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [160, "Title cannot exceed 160 characters"],
    },
    type: {
      type: String,
      enum: {
        values: TASK_TYPES,
        message: "Type must be assignment, exam, or presentation",
      },
      required: [true, "Task type is required"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITY_LEVELS,
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUS,
        message: "Status must be Not Started, In Progress, or Completed",
      },
      default: "Not Started",
    },
    urgencyLevel: {
      type: String,
      enum: {
        values: URGENCY_LEVELS,
        message: "Urgency level must be Low, Medium, or High",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1200, "Description cannot exceed 1200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1 });
taskSchema.index({ deadline: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
