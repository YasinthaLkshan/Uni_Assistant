import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";

dotenv.config();

const linkProfilesToUser = async () => {
  try {
    await connectDB();

    // Find the first student user (not admin)
    const user = await User.findOne({ role: "student" });
    
    if (!user) {
      console.log("No student user found. Creating one...");
      // Create a test student user if none exists
      const newUser = await User.create({
        registerNo: "IT30000101",
        password: "password123",
        role: "student",
      });
      console.log(`Created user: ${newUser._id}`);
    }

    const targetUserId = user?._id || newUser._id;

    // Link first student profile to this user
    const result = await StudentProfile.updateOne(
      { studentId: "IT30000101" },
      { $set: { user: targetUserId } }
    );

    console.log(`Linked student profile to user ${targetUserId}`);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error(`Failed to link student profiles: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

linkProfilesToUser();
