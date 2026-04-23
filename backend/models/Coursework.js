import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const courseworkSchema = new mongoose.Schema(
  {
    faculty: {
      type: String,
      enum: [ACADEMIC_FACULTY],
      default: ACADEMIC_FACULTY,
      immutable: true,
    },
    academicYear: {
      type: Number,
      enum: [ACADEMIC_YEAR],
      default: ACADEMIC_YEAR,
      immutable: true,
    },
    semester: {
      type: Number,
      enum: ACADEMIC_SEMESTERS,
      required: [true, "Semester is required"],
    },
    groupNumber: {
      type: Number,
      enum: ACADEMIC_GROUPS,
      required: [true, "Group number is required"],
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleCode: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, "Module code is required"],
    },
    moduleName: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    courseworkTitle: {
      type: String,
      required: [true, "Coursework title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    courseworkType: {
      type: String,
      enum: ["Assignment", "Lab Report", "Project", "Quiz"],
      required: [true, "Coursework type is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
      default: "",
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    weightPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    fileName: {
      type: String,
      trim: true,
      default: "",
    },
    fileSize: {
      type: String,
      trim: true,
      default: "",
    },
    filePath: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

courseworkSchema.index({ lecturer: 1, moduleCode: 1 });
courseworkSchema.index({ status: 1 });
courseworkSchema.index({ semester: 1, groupNumber: 1 });

const Coursework = mongoose.model("Coursework", courseworkSchema);

export default Coursework;
