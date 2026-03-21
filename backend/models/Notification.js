import mongoose from "mongoose";

const NOTIFICATION_TYPES = ["workload", "deadline", "attendance", "gpa", "general"];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      minlength: [2, "Message must be at least 2 characters long"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: "Type must be one of workload, deadline, attendance, gpa, or general",
      },
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
