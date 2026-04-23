import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
    },
    moduleCode: {
      type: String,
      required: [true, "Module code is required"],
      trim: true,
      uppercase: true,
    },
    moduleName: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
    },
  },
  { timestamps: true }
);

announcementSchema.index({ moduleCode: 1 });
announcementSchema.index({ lecturer: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
