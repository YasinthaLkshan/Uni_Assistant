import bcrypt from "bcryptjs";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

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
    name,
    email: normalizedEmail,
    password: hashedPassword,
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
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
      },
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
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
