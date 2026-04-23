import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const materialSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    materialType: {
      type: String,
      enum: ["Lecture Slides", "Notes", "Reading Material", "Lab Sheet", "Tutorial"],
      required: [true, "Material type is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
      default: "",
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
  },
  { timestamps: true }
);

materialSchema.index({ lecturer: 1, moduleCode: 1 });
materialSchema.index({ semester: 1, groupNumber: 1 });

const Material = mongoose.model("Material", materialSchema);

export default Material;
