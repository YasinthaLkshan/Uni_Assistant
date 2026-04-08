import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

dotenv.config();

const createTestTasks = async () => {
  try {
    await connectDB();

    // Find the student user
    const user = await User.findOne({ role: "student" });
    
    if (!user) {
      console.log("No student user found");
      return;
    }

    const now = new Date();
    
    // Create some test tasks for preparation
    const tasks = [
      {
        user: user._id,
        title: "Chapter 3 & 4 Review",
        description: "Review chapters 3 and 4 of main textbook",
        type: "exam",
        urgencyLevel: "High",
        status: "Not Started",
        deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
      {
        user: user._id,
        title: "Practice Problems Set 1",
        description: "Complete practice problems 1-20",
        type: "assignment",
        urgencyLevel: "High",
        status: "Not Started",
        deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        user: user._id,
        title: "Flashcards Preparation",
        description: "Create flashcards for key concepts",
        type: "assignment",
        urgencyLevel: "Medium",
        status: "Not Started",
        deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      },
      {
        user: user._id,
        title: "Mock Exam Practice",
        description: "Take the practice exam",
        type: "exam",
        urgencyLevel: "Medium",
        status: "Not Started",
        deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        user: user._id,
        title: "Group Project Presentation",
        description: "Prepare presentation slides and content",
        type: "presentation",
        urgencyLevel: "Medium",
        status: "Not Started",
        deadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      },
    ];

    const result = await Task.insertMany(tasks);
    console.log(`Created ${result.length} test tasks for user ${user._id}`);
    result.forEach((task, idx) => {
      console.log(`  ${idx + 1}. ${task.title} - Due: ${task.deadline.toLocaleDateString()}`);
    });
  } catch (error) {
    console.error(`Failed to create test tasks: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

createTestTasks();
