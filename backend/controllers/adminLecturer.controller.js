import bcrypt from "bcryptjs";

import User from "../models/User.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listLecturers = asyncHandler(async (_req, res) => {
  const lecturers = await User.find({ role: "lecturer" })
    .select("-password")
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    message: "Lecturers fetched successfully",
    data: lecturers,
  });
});

export const createLecturer = asyncHandler(async (req, res) => {
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

  const lecturer = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "lecturer",
    department: department?.trim() || undefined,
  });

  res.status(201).json({
    success: true,
    message: "Lecturer created successfully",
    data: {
      id: lecturer._id,
      name: lecturer.name,
      email: lecturer.email,
      role: lecturer.role,
      department: lecturer.department,
    },
  });
});

export const updateLecturer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, department, password } = req.body;

  const lecturer = await User.findOne({ _id: id, role: "lecturer" });

  if (!lecturer) {
    throw new AppError("Lecturer not found", 404);
  }

  if (name) lecturer.name = name.trim();
  if (department !== undefined) lecturer.department = department.trim();

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== lecturer.email) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new AppError("Email is already registered", 409);
      }
      lecturer.email = normalizedEmail;
    }
  }

  if (password) {
    lecturer.password = await bcrypt.hash(password, 12);
  }

  await lecturer.save();

  res.status(200).json({
    success: true,
    message: "Lecturer updated successfully",
    data: {
      id: lecturer._id,
      name: lecturer.name,
      email: lecturer.email,
      role: lecturer.role,
      department: lecturer.department,
    },
  });
});

export const deleteLecturer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lecturer = await User.findOneAndDelete({ _id: id, role: "lecturer" });

  if (!lecturer) {
    throw new AppError("Lecturer not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Lecturer deleted successfully",
  });
});
