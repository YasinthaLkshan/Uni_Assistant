import mongoose from "mongoose";

const materialViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "Material is required"],
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

materialViewSchema.index({ user: 1, material: 1 }, { unique: true });

const MaterialView = mongoose.model("MaterialView", materialViewSchema);

export default MaterialView;
