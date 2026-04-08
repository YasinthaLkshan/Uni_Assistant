import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import StudentProfile from "../models/StudentProfile.js";
import Task from "../models/Task.js";
import AcademicEvent from "../models/AcademicEvent.js";

dotenv.config();

const verifyData = async () => {
  try {
    await connectDB();

    const userId = "69c30e019cab96acf5ef0829";

    console.log("\n=== VERIFICATION REPORT ===\n");

    // Check StudentProfile
    const profile = await StudentProfile.findOne({ user: userId }).lean();
    console.log(`✓ StudentProfile for user ${userId}:`);
    if (profile) {
      console.log(`  - Student ID: ${profile.studentId}`);
      console.log(`  - Full Name: ${profile.fullName}`);
      console.log(`  - Semester: ${profile.semester}`);
      console.log(`  - Group: ${profile.groupNumber}`);
    } else {
      console.log(`  ✗ NOT FOUND`);
    }

    // Check Tasks
    const tasks = await Task.find({ user: userId }).lean();
    console.log(`\n✓ Tasks for user: ${tasks.length} found`);
    tasks.forEach((task, idx) => {
      console.log(`  ${idx + 1}. ${task.title}`);
      console.log(`     - Type: ${task.type}, Urgency: ${task.urgencyLevel}`);
      console.log(`     - Deadline: ${task.deadline.toLocaleDateString()}`);
    });

    // Check AcademicEvents for student's group
    if (profile) {
      const events = await AcademicEvent.find({
        semester: profile.semester,
        groupNumber: profile.groupNumber,
        eventDate: { $gt: new Date() }
      }).lean();
      console.log(`\n✓ Academic Events for Semester ${profile.semester}, Group ${profile.groupNumber}: ${events.length} found`);
      events.forEach((event, idx) => {
        console.log(`  ${idx + 1}. ${event.title}`);
        console.log(`     - Type: ${event.eventType}, Weight: ${event.weightPercentage}%`);
        console.log(`     - Date: ${new Date(event.eventDate).toLocaleDateString()}`);
      });
    }

    console.log("\n=== END VERIFICATION ===\n");
  } catch (error) {
    console.error(`Verification failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

verifyData();
