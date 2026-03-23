import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const DEFAULT_ADMIN = {
  name: "Admin",
  username: "Admin",
  email: "admin@uniassistant.com",
  password: "Admin123",
  role: "admin",
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const normalizedEmail = DEFAULT_ADMIN.email.trim().toLowerCase();
    const normalizedUsername = DEFAULT_ADMIN.username.trim().toLowerCase();

    const existingAdmin = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingAdmin) {
      console.log("Admin account already exists. No duplicate created.");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    await User.create({
      name: DEFAULT_ADMIN.name,
      username: DEFAULT_ADMIN.username,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
    });

    console.log("Default admin account seeded successfully.");
  } catch (error) {
    console.error(`Failed to seed admin account: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
