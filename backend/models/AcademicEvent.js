import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const academicEventSchema = new mongoose.Schema(
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
    // Legacy scope field retained for existing generic academic routes.
    year: {
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
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },
    moduleCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    moduleName: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    eventType: {
      type: String,
      enum: [
        "Assignment",
        "Presentation",
        "Viva",
        "Lab Test",
        "Exam",
        "Spot Test",
        "Seminar",
        // Legacy values retained to avoid breaking existing generic event flow.
        "lecture",
        "workshop",
        "deadline",
        "exam",
        "presentation",
        "notice",
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
      default: "",
    },
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      match: [/^$|^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24-hour HH:mm format"],
      default: "",
    },
    endTime: {
      type: String,
      match: [/^$|^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24-hour HH:mm format"],
      default: "",
    },
    venue: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    weightPercentage: {
      type: Number,
      min: [0, "weightPercentage cannot be less than 0"],
      max: [100, "weightPercentage cannot exceed 100"],
      default: 0,
    },
    status: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

academicEventSchema.pre("validate", function syncAcademicYear(next) {
  if (!this.academicYear && this.year) {
    this.academicYear = this.year;
  }

  if (!this.year && this.academicYear) {
    this.year = this.academicYear;
  }

  next();
});

academicEventSchema.index({ semester: 1, groupNumber: 1, eventType: 1 });
academicEventSchema.index({ module: 1, moduleCode: 1 });
academicEventSchema.index({ eventDate: 1, startTime: 1 });

const AcademicEvent = mongoose.model("AcademicEvent", academicEventSchema);

export default AcademicEvent;
