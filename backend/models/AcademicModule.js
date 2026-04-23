import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const academicModuleSchema = new mongoose.Schema(
  {
    moduleCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    semester: {
      type: Number,
      enum: ACADEMIC_SEMESTERS,
      required: true,
    },
    groups: {
      type: [
        {
          type: Number,
          enum: ACADEMIC_GROUPS,
        },
      ],
      default: ACADEMIC_GROUPS,
    },
    credits: {
      type: Number,
      min: 1,
      max: 10,
      default: 3,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    faculty: {
      type: String,
      enum: [ACADEMIC_FACULTY],
      default: ACADEMIC_FACULTY,
      immutable: true,
    },
    year: {
      type: Number,
      enum: [ACADEMIC_YEAR],
      default: ACADEMIC_YEAR,
      immutable: true,
    },
  },
  { timestamps: true }
);

const AcademicModule = mongoose.model("AcademicModule", academicModuleSchema);

export default AcademicModule;
