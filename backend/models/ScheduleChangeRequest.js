import mongoose from "mongoose";

const REQUEST_STATUSES = ["pending", "approved", "rejected"];

const scheduleChangeRequestSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureSchedule",
      required: [true, "Session reference is required"],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    group: {
      type: Number,
      required: true,
      min: 1,
    },
    // Current schedule details (snapshot at time of request)
    currentDate: {
      type: Date,
      required: true,
    },
    currentSlot: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    currentType: {
      type: String,
      enum: ["theory", "lab"],
      required: true,
    },
    // Proposed reschedule
    proposedDate: {
      type: Date,
      required: [true, "Proposed date is required"],
    },
    proposedSlot: {
      type: Number,
      enum: [1, 2, 3],
      required: [true, "Proposed slot is required"],
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
