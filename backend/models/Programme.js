import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";

const programmeSchema = new mongoose.Schema(
  {
    programmeCode: {
      type: String,
      required: [true, "Programme code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    programmeName: {
      type: String,
      required: [true, "Programme name is required"],
      trim: true,
      maxlength: 200,
    },
    programmeType: {
      type: String,
      enum: ["BSc", "HND", "Diploma", "Certificate"],
      required: true,
    },
    duration: {
      type: Number,
      min: 1,
      max: 6,
      default: 4,
    },
    faculty: {
      type: String,
      enum: [ACADEMIC_FACULTY],
      default: ACADEMIC_FACULTY,
    },
    groups: {
      type: [Number],
      default: [1, 2, 3],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Programme = mongoose.model("Programme", programmeSchema);

export default Programme;
