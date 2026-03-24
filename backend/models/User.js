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
      enum: ["admin", "student"],
      default: "student",
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      required: [
        function requiredForAdmins() {
          return this.role === "admin";
        },
        "Username is required for admin users",
      ],
    },
    studentId: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^IT\d{8}$/, "Student ID must be in format IT followed by 8 numbers"],
    },
    faculty: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    academicYear: {
      type: Number,
      min: [1, "Academic year must be at least 1"],
      max: [8, "Academic year cannot exceed 8"],
    },
    groupNumber: {
      type: Number,
      min: [1, "Group number must be at least 1"],
      max: [20, "Group number cannot exceed 20"],
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

userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: {
      username: { $exists: true, $type: "string" },
    },
  }
);

userSchema.index(
  { studentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "student",
      studentId: { $exists: true, $type: "string" },
    },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
