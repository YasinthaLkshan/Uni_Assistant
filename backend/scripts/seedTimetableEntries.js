import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Module from "../models/Module.js";
import TimetableEntry from "../models/TimetableEntry.js";

dotenv.config();

const TIMETABLE_ENTRIES = [
  { semester: 1, groupNumber: 1, moduleCode: "ITM301", moduleName: "Advanced Database Systems", dayOfWeek: "Monday", activityType: "Lecture", startTime: "08:30", endTime: "10:30", venue: "Auditorium A1", lecturerNames: ["Dr. R. Seneviratne"], note: "Core theory session" },
  { semester: 1, groupNumber: 1, moduleCode: "ITM302", moduleName: "Cloud Application Development", dayOfWeek: "Tuesday", activityType: "Lab", startTime: "13:00", endTime: "15:00", venue: "Cloud Lab 03", lecturerNames: ["Ms. D. Fernando"], note: "Hands-on Kubernetes deployment" },
  { semester: 1, groupNumber: 2, moduleCode: "ITM303", moduleName: "Information Security Engineering", dayOfWeek: "Wednesday", activityType: "Lecture", startTime: "09:00", endTime: "11:00", venue: "Hall B2", lecturerNames: ["Dr. P. Jayawardena"], note: "Threat modeling and risk analysis" },
  { semester: 1, groupNumber: 2, moduleCode: "ITM304", moduleName: "Human Computer Interaction", dayOfWeek: "Thursday", activityType: "Tutorial", startTime: "11:30", endTime: "13:00", venue: "Studio HCI-1", lecturerNames: ["Mr. S. Karunaratne"], note: "Usability heuristic discussion" },
  { semester: 1, groupNumber: 3, moduleCode: "ITM301", moduleName: "Advanced Database Systems", dayOfWeek: "Monday", activityType: "Lab", startTime: "14:00", endTime: "16:00", venue: "DB Lab 02", lecturerNames: ["Ms. T. Nanayakkara"], note: "Query optimization practical" },
  { semester: 1, groupNumber: 3, moduleCode: "ITM304", moduleName: "Human Computer Interaction", dayOfWeek: "Friday", activityType: "Lecture", startTime: "08:30", endTime: "10:00", venue: "Auditorium C1", lecturerNames: ["Dr. A. Ramanayake"], note: "Accessible design systems" },
  { semester: 2, groupNumber: 1, moduleCode: "ITM351", moduleName: "Machine Learning Fundamentals", dayOfWeek: "Monday", activityType: "Lecture", startTime: "10:30", endTime: "12:30", venue: "Hall ML-1", lecturerNames: ["Dr. K. Dissanayake"], note: "Regression and model evaluation" },
  { semester: 2, groupNumber: 1, moduleCode: "ITM352", moduleName: "Mobile Application Engineering", dayOfWeek: "Thursday", activityType: "Lab", startTime: "13:00", endTime: "15:00", venue: "Mobile Lab 01", lecturerNames: ["Ms. H. Perera"], note: "React Native navigation lab" },
  { semester: 2, groupNumber: 2, moduleCode: "ITM353", moduleName: "Software Quality Assurance", dayOfWeek: "Tuesday", activityType: "Tutorial", startTime: "09:30", endTime: "11:00", venue: "QA Studio", lecturerNames: ["Mr. N. Rodrigo"], note: "Automation planning session" },
  { semester: 2, groupNumber: 2, moduleCode: "ITM354", moduleName: "Enterprise Architecture", dayOfWeek: "Friday", activityType: "Lecture", startTime: "11:00", endTime: "13:00", venue: "Auditorium EA", lecturerNames: ["Dr. V. Gunathilake"], note: "Architecture governance and patterns" },
  { semester: 2, groupNumber: 3, moduleCode: "ITM351", moduleName: "Machine Learning Fundamentals", dayOfWeek: "Wednesday", activityType: "Lab", startTime: "14:00", endTime: "16:00", venue: "Data Lab 05", lecturerNames: ["Ms. I. Senarath"], note: "Feature engineering practical" },
  { semester: 2, groupNumber: 3, moduleCode: "ITM352", moduleName: "Mobile Application Engineering", dayOfWeek: "Saturday", activityType: "Workshop", startTime: "09:00", endTime: "12:00", venue: "Innovation Hub", lecturerNames: ["Mr. C. Weerasinghe"], note: "End-to-end app demo workshop" },
];

const seedTimetableEntries = async () => {
  try {
    await connectDB();

    const moduleCodes = [...new Set(TIMETABLE_ENTRIES.map((entry) => entry.moduleCode))];
    const modules = await Module.find({ moduleCode: { $in: moduleCodes } }).select("_id moduleCode");
    const moduleMap = new Map(modules.map((moduleDoc) => [moduleDoc.moduleCode, moduleDoc._id]));

    const operations = TIMETABLE_ENTRIES.map((entry) => ({
      updateOne: {
        filter: {
          semester: entry.semester,
          groupNumber: entry.groupNumber,
          moduleCode: entry.moduleCode,
          dayOfWeek: entry.dayOfWeek,
          startTime: entry.startTime,
          venue: entry.venue,
        },
        update: {
          $set: {
            ...entry,
            module: moduleMap.get(entry.moduleCode) || null,
          },
        },
        upsert: true,
      },
    }));

    const result = await TimetableEntry.bulkWrite(operations, { ordered: false });

    console.log("Timetable entries seed completed.");
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
  } catch (error) {
    console.error(`Failed to seed timetable entries: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedTimetableEntries();