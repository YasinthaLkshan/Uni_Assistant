import mongoose from "mongoose";

import { ACADEMIC_FACULTY } from "../constants/academicScope.js";

const TIME_SLOTS = [
  { slot: 1, startTime: "09:00", endTime: "11:00" },
  { slot: 2, startTime: "11:30", endTime: "13:30" },
  { slot: 3, startTime: "14:00", endTime: "16:00" },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const lectureScheduleSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module is required"],
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
    },
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      default: null,
    },
    group: {
      type: Number,
      required: [true, "Group is required"],
      min: 1,
    },
    academicYear: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    dayOfWeek: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    slot: {
      type: Number,
      enum: [1, 2, 3],
      required: [true, "Time slot is required"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["theory", "lab"],
      required: [true, "Session type is required"],
    },
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
    faculty: {
      type: String,
      enum: [ACADEMIC_FACULTY],
      default: ACADEMIC_FACULTY,
      immutable: true,
    },
  },
  { timestamps: true }
);

lectureScheduleSchema.index(
  { lecturer: 1, date: 1, slot: 1 },
  { unique: true }
);

lectureScheduleSchema.index(
  { programme: 1, academicYear: 1, group: 1, date: 1, slot: 1 },
  { unique: true, sparse: true }
);

lectureScheduleSchema.index({ module: 1, lecturer: 1, group: 1 });

export { TIME_SLOTS, DAYS_OF_WEEK };

const LectureSchedule = mongoose.model("LectureSchedule", lectureScheduleSchema);

export default LectureSchedule;
