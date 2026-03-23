import bcrypt from "bcryptjs";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { studentId, name, email, password } = req.body;

  if (!studentId || !name || !email || !password) {
    throw new AppError("Student ID, name, email, and password are required", 400);
  }

  const normalizedStudentId = studentId.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^IT\d{8}$/.test(normalizedStudentId)) {
    throw new AppError("Student ID must be in format IT followed by 8 numbers", 400);
  }

  const profile = await StudentProfile.findOne({ studentId: normalizedStudentId });

  if (!profile) {
    throw new AppError("Student profile not found. Please contact admin to preload your student record.", 404);
  }

  if (profile.user || profile.registrationStatus === "registered") {
    throw new AppError("This student ID is already linked to a registered account.", 409);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  const existingStudentId = await User.findOne({ studentId: normalizedStudentId, role: "student" });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  if (existingStudentId) {
    throw new AppError("Student ID is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    studentId: normalizedStudentId,
    email: normalizedEmail,
    password: hashedPassword,
    role: "student",
    faculty: profile.faculty,
    academicYear: profile.academicYear,
    semester: profile.semester,
    groupNumber: profile.groupNumber,
  });

  profile.user = user._id;
  profile.registrationStatus = "registered";
  await profile.save();

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
        academicYear: user.academicYear,
        groupNumber: user.groupNumber,
        department: user.department,
        semester: user.semester,
      },
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, username, email, password } = req.body;

  const loginIdentifier = (identifier || username || email || "").trim();

  if (!loginIdentifier || !password) {
    throw new AppError("Login identifier and password are required", 400);
  }

  const normalizedIdentifier = loginIdentifier.toLowerCase();
  const isEmailIdentifier = /^\S+@\S+\.\S+$/.test(loginIdentifier);
  const isStudentIdIdentifier = /^IT\d{8}$/i.test(loginIdentifier);

  const userQuery = isEmailIdentifier
    ? { email: normalizedIdentifier, role: "student" }
    : isStudentIdIdentifier
      ? { studentId: loginIdentifier.toUpperCase(), role: "student" }
      : { username: normalizedIdentifier, role: "admin" };

  const user = await User.findOne(userQuery).select("+password");

  if (!user) {
    const authErrorMessage = isEmailIdentifier || isStudentIdIdentifier
      ? "Invalid student email/ID or password"
      : "Invalid admin username or password";
    throw new AppError(authErrorMessage, 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const authErrorMessage = isEmailIdentifier || isStudentIdIdentifier
      ? "Invalid student email/ID or password"
      : "Invalid admin username or password";
    throw new AppError(authErrorMessage, 401);
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
      },
    },
  });
});

export const register = registerUser;
export const login = loginUser;

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile fetched",
    data: req.user,
  });
});
