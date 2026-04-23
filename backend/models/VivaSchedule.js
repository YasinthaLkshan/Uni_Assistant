import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";

const VIVA_TYPES = ["documentation_30", "progress_80", "final"];

const VIVA_TYPE_LABELS = {
  documentation_30: "Documentation Check (30%)",
  progress_80: "Progress Check (80%)",
  final: "Final Viva",
};

const vivaScheduleSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module is required"],
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
    },
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      default: null,
    },
    group: {
      type: Number,
      required: [true, "Group is required"],
      min: 1,
    },
    academicYear: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    // Assignment reference (optional — links to Coursework or AcademicEvent)
    assignmentTitle: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: 200,
    },
    vivaType: {
      type: String,
      enum: VIVA_TYPES,
      required: [true, "Viva type is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    slot: {
      type: Number,
      enum: [1, 2, 3],
      required: [true, "Time slot is required"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["proposed", "approved", "rejected"],
      default: "proposed",
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    faculty: {
      type: String,
      enum: [ACADEMIC_FACULTY],
      default: ACADEMIC_FACULTY,
      immutable: true,
    },
  },
  { timestamps: true }
);

vivaScheduleSchema.index({ module: 1, group: 1, vivaType: 1 });
vivaScheduleSchema.index({ lecturer: 1, date: 1, slot: 1 });
vivaScheduleSchema.index({ status: 1 });

export { VIVA_TYPES, VIVA_TYPE_LABELS };

const VivaSchedule = mongoose.model("VivaSchedule", vivaScheduleSchema);

export default VivaSchedule;
