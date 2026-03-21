import mongoose from "mongoose";

const WORKLOAD_LEVELS = ["Low", "Medium", "High"];

const workloadReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    workloadScore: {
      type: Number,
      required: [true, "Workload score is required"],
      min: [0, "Workload score cannot be negative"],
    },
    workloadLevel: {
      type: String,
      enum: {
        values: WORKLOAD_LEVELS,
        message: "Workload level must be Low, Medium, or High",
      },
    },
    totalTasks: {
      type: Number,
      default: 0,
      min: [0, "Total tasks cannot be negative"],
    },
    urgentTasks: {
      type: Number,
      default: 0,
      min: [0, "Urgent tasks cannot be negative"],
    },
    examsNear: {
      type: Number,
      default: 0,
      min: [0, "Exams near cannot be negative"],
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

workloadReportSchema.index({ user: 1 });

const WorkloadReport = mongoose.model("WorkloadReport", workloadReportSchema);

export default WorkloadReport;
