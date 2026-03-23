import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import StudentProfile from "../models/StudentProfile.js";

dotenv.config();

const fixStudentProfileIndexes = async () => {
  try {
    await connectDB();

    const indexes = await StudentProfile.collection.indexes();
    const emailIndexes = indexes.filter((index) => Object.prototype.hasOwnProperty.call(index.key || {}, "email"));

    if (emailIndexes.length === 0) {
      console.log("No email index found on StudentProfile collection. No changes made.");
      return;
    }

    for (const index of emailIndexes) {
      if (index.name === "_id_") {
        continue;
      }

      await StudentProfile.collection.dropIndex(index.name);
      console.log(`Dropped index: ${index.name}`);
    }

    console.log("StudentProfile index cleanup completed.");
  } catch (error) {
    console.error(`Failed to fix StudentProfile indexes: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

fixStudentProfileIndexes();
