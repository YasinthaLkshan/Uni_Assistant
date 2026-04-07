import mongoose from "mongoose";

import { ACADEMIC_FACULTY, ACADEMIC_SEMESTERS, ACADEMIC_YEAR } from "../constants/academicScope.js";

const assessmentCriteriaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    percentage: {
      type: Number,
      required: true,
      min: [0, "Percentage cannot be less than 0"],
      max: [100, "Percentage cannot exceed 100"],
    },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleCode: {
      type: String,
      required: [true, "Module code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    moduleName: {
      type: String,
      required: [true, "Module name is required"],
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
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
    lectureHoursPerWeek: {
      type: Number,
      min: [0, "Lecture hours cannot be negative"],
      default: 0,
    },
    tutorialHoursPerWeek: {
      type: Number,
      min: [0, "Tutorial hours cannot be negative"],
      default: 0,
    },
    labHoursPerWeek: {
      type: Number,
      min: [0, "Lab hours cannot be negative"],
      default: 0,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    outline: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },
    assessmentCriteria: {
      type: [assessmentCriteriaSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;
