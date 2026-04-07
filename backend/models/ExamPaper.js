import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const examPaperSchema = new mongoose.Schema(
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
    groups: {
      type: [Number],
      validate: {
        validator: (arr) =>
          arr.length > 0 && arr.every((g) => ACADEMIC_GROUPS.includes(g)),
        message: "At least one valid group is required",
      },
      required: [true, "Groups are required"],
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
    examTitle: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    examType: {
      type: String,
      enum: ["Mid-Semester", "End-Semester", "Supplementary"],
      required: [true, "Exam type is required"],
    },
    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    duration: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    totalMarks: {
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

examPaperSchema.index({ lecturer: 1, moduleCode: 1 });
examPaperSchema.index({ status: 1 });
examPaperSchema.index({ semester: 1 });

const ExamPaper = mongoose.model("ExamPaper", examPaperSchema);

export default ExamPaper;
