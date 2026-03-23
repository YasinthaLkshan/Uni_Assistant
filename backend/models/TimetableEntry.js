import mongoose from "mongoose";

import {
  ACADEMIC_FACULTY,
  ACADEMIC_GROUPS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEAR,
} from "../constants/academicScope.js";

const timetableEntrySchema = new mongoose.Schema(
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
      required: true,
      trim: true,
      uppercase: true,
    },
    moduleName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    // Legacy field retained for compatibility with existing controller payloads.
    moduleTitle: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    activityType: {
      type: String,
      enum: ["Lecture", "Tutorial", "Lab", "Practical", "Workshop", "Evaluation"],
      required: true,
      default: "Lecture",
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24-hour HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24-hour HH:mm format"],
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    lecturerNames: {
      type: [String],
      default: [],
      validate: {
        validator: (names) => Array.isArray(names) && names.every((name) => typeof name === "string" && name.trim().length > 0),
        message: "lecturerNames must be an array of non-empty strings",
      },
    },
    // Legacy field retained for compatibility with existing controller payloads.
    lecturer: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

timetableEntrySchema.pre("validate", function syncLegacyFields(next) {
  if (!this.academicYear && this.year) {
    this.academicYear = this.year;
  }

  if (!this.year && this.academicYear) {
    this.year = this.academicYear;
  }

  if (!this.moduleName && this.moduleTitle) {
    this.moduleName = this.moduleTitle;
  }

  if (!this.moduleTitle && this.moduleName) {
    this.moduleTitle = this.moduleName;
  }

  if ((!this.lecturerNames || this.lecturerNames.length === 0) && this.lecturer) {
    this.lecturerNames = [this.lecturer];
  }

  if ((!this.lecturer || this.lecturer.trim().length === 0) && Array.isArray(this.lecturerNames) && this.lecturerNames.length > 0) {
    this.lecturer = this.lecturerNames.join(", ");
  }

  if (Array.isArray(this.lecturerNames)) {
    this.lecturerNames = this.lecturerNames.map((name) => String(name).trim()).filter(Boolean);
  }

  next();
});

timetableEntrySchema.index({ semester: 1 });
timetableEntrySchema.index({ groupNumber: 1 });
timetableEntrySchema.index({ dayOfWeek: 1 });
timetableEntrySchema.index({ moduleCode: 1 });

const TimetableEntry = mongoose.model("TimetableEntry", timetableEntrySchema);

export default TimetableEntry;
