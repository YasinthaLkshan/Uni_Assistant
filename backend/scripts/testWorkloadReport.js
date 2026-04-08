import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import { generateEnhancedWorkloadReportForUser } from "../services/workloadService.js";

dotenv.config();

const testWorkload = async () => {
  try {
    await connectDB();

    const userId = "69c30e019cab96acf5ef0829";

    console.log("\n=== WORKLOAD REPORT TEST ===\n");
    console.log(`Testing workload calculation for user: ${userId}`);

    const report = await generateEnhancedWorkloadReportForUser(userId);

    console.log("\n--- METRICS ---");
    console.log(`Active Tasks: ${report.metrics.activeTasks}`);
    console.log(`Upcoming Tasks: ${report.metrics.upcomingTasks}`);
    console.log(`Urgent Tasks: ${report.metrics.urgentTasks}`);
    console.log(`Workload Score: ${report.metrics.workloadScore}`);
    console.log(`Workload Level: ${report.metrics.workloadLevel}`);

    console.log("\n--- ANALYSIS ---");
    console.log(`Intensity: ${report.workloadAnalysis.intensity}`);
    console.log(`Level: ${report.workloadAnalysis.level}`);
    console.log(`Recommendation: ${report.workloadAnalysis.recommendation}`);

    console.log("\n--- STUDY SUGGESTION ---");
    console.log(`Hours/Day: ${report.studySuggestion.suggestedStudyHoursPerDay}`);
    console.log(`Focus: ${report.studySuggestion.focus}`);
    console.log(`Strategy: ${report.studySuggestion.strategy}`);

    console.log("\n--- MOST URGENT EVENT ---");
    if (report.mostUrgentEvent) {
      console.log(`Title: ${report.mostUrgentEvent.title}`);
      console.log(`Type: ${report.mostUrgentEvent.type}`);
      console.log(`Days Left: ${report.mostUrgentEvent.daysLeft}`);
      console.log(`Urgency Level: ${report.mostUrgentEvent.urgencyLevel}`);
    } else {
      console.log("No urgent events");
    }

    console.log("\n=== END TEST ===\n");
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

testWorkload();
