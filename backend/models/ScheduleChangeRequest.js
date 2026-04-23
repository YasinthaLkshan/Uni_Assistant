import mongoose from "mongoose";

const REQUEST_STATUSES = ["pending", "approved", "rejected"];

const scheduleChangeRequestSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
    },
    timetableEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableEntry",
      required: [true, "Timetable entry reference is required"],
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
    },
    group: {
      type: Number,
      required: true,
      min: 1,
    },
    // Current schedule details (snapshot at time of request)
    currentDay: {
      type: String,
      required: true,
    },
    currentTime: {
      type: String,
      required: true,
    },
    // Proposed reschedule
    proposedDate: {
      type: Date,
      required: [true, "Proposed date is required"],
    },
    proposedTime: {
      type: String,
      required: [true, "Proposed time is required"],
    },
    // Reason from lecturer
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: 1000,
    },
    // Admin response
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

scheduleChangeRequestSchema.index({ lecturer: 1, status: 1 });
scheduleChangeRequestSchema.index({ status: 1 });

const ScheduleChangeRequest = mongoose.model("ScheduleChangeRequest", scheduleChangeRequestSchema);

export default ScheduleChangeRequest;
