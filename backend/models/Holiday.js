import mongoose from "mongoose";

const HOLIDAY_TYPES = ["poya", "public", "university"];

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: HOLIDAY_TYPES,
      required: [true, "Holiday type is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

holidaySchema.index({ date: 1 });

export const HOLIDAY_TYPES_LIST = HOLIDAY_TYPES;

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
