import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^IT\d{8}$/, "Student ID must be IT followed by 8 digits"],
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
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
      required: true,
    },
    groupNumber: {
      type: Number,
      enum: ACADEMIC_GROUPS,
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ["pending", "registered"],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
