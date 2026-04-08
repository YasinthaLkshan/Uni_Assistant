import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";

const PROGRAMME_TYPES = ["BSc", "HND", "Diploma", "Certificate"];

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
      minlength: 2,
      maxlength: 200,
    },
    programmeType: {
      type: String,
      enum: PROGRAMME_TYPES,
      required: [true, "Programme type is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 year"],
      max: [4, "Duration cannot exceed 4 years"],
    },
    faculty: {
      type: String,
      enum: [ACADEMIC_FACULTY],
      default: ACADEMIC_FACULTY,
      immutable: true,
    },
    groups: {
      type: [Number],
      default: [1, 2, 3],
      validate: {
        validator: (arr) => arr.length > 0 && arr.every((g) => g >= 1),
        message: "Groups must have at least one group with positive numbers",
      },
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

export const PROGRAMME_TYPES_LIST = PROGRAMME_TYPES;

const Programme = mongoose.model("Programme", programmeSchema);

export default Programme;
