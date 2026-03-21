import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    department: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    semester: {
      type: Number,
      min: [1, "Semester must be at least 1"],
      max: [16, "Semester cannot exceed 16"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
