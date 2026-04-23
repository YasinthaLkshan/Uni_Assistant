import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    moduleName: {
      type: String,
      trim: true,
      default: "",
    },
    // Ratings 1–5
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    teachingQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    contentClarity: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    engagementLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One feedback per student per module per lecturer
feedbackSchema.index({ student: 1, lecturer: 1, moduleCode: 1 }, { unique: true });
feedbackSchema.index({ lecturer: 1, createdAt: -1 });
feedbackSchema.index({ moduleCode: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
