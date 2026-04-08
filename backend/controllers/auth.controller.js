import bcrypt from "bcryptjs";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { studentId, name, email, password, academicYear, semester, groupNumber } = req.body;

  if (!studentId || !name || !email || !password || !academicYear || !semester || !groupNumber) {
    throw new AppError(
      "Student ID, name, email, password, academic year, semester, and group number are required",
      400
    );
  }

  const normalizedStudentId = studentId.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  const parsedAcademicYear = Number(academicYear);
  const parsedSemester = Number(semester);
  const parsedGroupNumber = Number(groupNumber);

  if (!/^IT\d{8}$/.test(normalizedStudentId)) {
    throw new AppError("Student ID must be in format IT followed by 8 numbers", 400);
  }

  if (parsedAcademicYear !== 3) {
    throw new AppError("Academic year must be 3", 400);
  }

  if (![1, 2].includes(parsedSemester)) {
    throw new AppError("Semester must be 1 or 2", 400);
  }

  if (![1, 2, 3].includes(parsedGroupNumber)) {
    throw new AppError("Group number must be 1, 2, or 3", 400);
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
    faculty: "IT",
    academicYear: parsedAcademicYear,
    semester: parsedSemester,
    groupNumber: parsedGroupNumber,
  });

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
        semester: user.semester,
        groupNumber: user.groupNumber,
        department: user.department,
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
    ? { email: normalizedIdentifier }
    : isStudentIdIdentifier
      ? { studentId: loginIdentifier.toUpperCase(), role: "student" }
      : { username: normalizedIdentifier, role: "admin" };

  const user = await User.findOne(userQuery).select("+password");

  if (!user) {
    const authErrorMessage = isEmailIdentifier
      ? "Invalid email or password"
      : isStudentIdIdentifier
        ? "Invalid student ID or password"
        : "Invalid admin username or password";
    throw new AppError(authErrorMessage, 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const authErrorMessage = isEmailIdentifier
      ? "Invalid email or password"
      : isStudentIdIdentifier
        ? "Invalid student ID or password"
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
        faculty: user.faculty,
        academicYear: user.academicYear,
        groupNumber: user.groupNumber,
        department: user.department,
        semester: user.semester,
      },
    },
  });
});

export const registerLecturer = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "lecturer",
    department: department?.trim() || undefined,
  });

  res.status(201).json({
    success: true,
    message: "Lecturer account created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
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
