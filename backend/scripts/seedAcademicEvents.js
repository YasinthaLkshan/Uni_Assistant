import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import AcademicEvent from "../models/AcademicEvent.js";
import Module from "../models/Module.js";

dotenv.config();

const ACADEMIC_EVENTS = [
  { semester: 1, groupNumber: 1, moduleCode: "ITM301", moduleName: "Advanced Database Systems", title: "Index Optimization Assignment", eventType: "Assignment", description: "Submission of query optimization case study.", eventDate: "2026-04-12", startTime: "08:00", endTime: "23:59", venue: "LMS Portal", weightPercentage: 15, status: "Scheduled" },
  { semester: 1, groupNumber: 1, moduleCode: "ITM302", moduleName: "Cloud Application Development", title: "CI/CD Lab Test", eventType: "Lab Test", description: "Timed practical on pipeline setup and deployment.", eventDate: "2026-04-25", startTime: "13:00", endTime: "14:30", venue: "Cloud Lab 03", weightPercentage: 10, status: "Scheduled" },
  { semester: 1, groupNumber: 2, moduleCode: "ITM303", moduleName: "Information Security Engineering", title: "Security Seminar", eventType: "Seminar", description: "Group seminar on modern web attack surfaces.", eventDate: "2026-05-05", startTime: "10:00", endTime: "12:00", venue: "Hall B2", weightPercentage: 10, status: "Scheduled" },
  { semester: 1, groupNumber: 2, moduleCode: "ITM304", moduleName: "Human Computer Interaction", title: "Prototype Presentation", eventType: "Presentation", description: "Presentation of mobile-first accessibility prototype.", eventDate: "2026-05-18", startTime: "11:30", endTime: "13:30", venue: "Studio HCI-1", weightPercentage: 20, status: "Scheduled" },
  { semester: 1, groupNumber: 3, moduleCode: "ITM301", moduleName: "Advanced Database Systems", title: "Midterm Spot Test", eventType: "Spot Test", description: "Closed-book spot test on indexing and transactions.", eventDate: "2026-05-10", startTime: "09:00", endTime: "10:00", venue: "Auditorium A1", weightPercentage: 10, status: "Scheduled" },
  { semester: 1, groupNumber: 3, moduleCode: "ITM304", moduleName: "Human Computer Interaction", title: "Usability Viva", eventType: "Viva", description: "Individual viva based on usability testing report.", eventDate: "2026-05-29", startTime: "14:00", endTime: "17:00", venue: "HCI Interview Room", weightPercentage: 15, status: "Scheduled" },
  { semester: 2, groupNumber: 1, moduleCode: "ITM351", moduleName: "Machine Learning Fundamentals", title: "Model Evaluation Assignment", eventType: "Assignment", description: "Submit comparative model performance report.", eventDate: "2026-09-15", startTime: "08:00", endTime: "23:59", venue: "LMS Portal", weightPercentage: 20, status: "Scheduled" },
  { semester: 2, groupNumber: 1, moduleCode: "ITM352", moduleName: "Mobile Application Engineering", title: "Sprint Demo", eventType: "Presentation", description: "Team sprint review and app demo.", eventDate: "2026-10-02", startTime: "13:00", endTime: "15:00", venue: "Innovation Hub", weightPercentage: 15, status: "Scheduled" },
  { semester: 2, groupNumber: 2, moduleCode: "ITM353", moduleName: "Software Quality Assurance", title: "Automation Lab Test", eventType: "Lab Test", description: "Practical test on UI automation frameworks.", eventDate: "2026-09-28", startTime: "09:30", endTime: "11:00", venue: "QA Studio", weightPercentage: 15, status: "Scheduled" },
  { semester: 2, groupNumber: 2, moduleCode: "ITM354", moduleName: "Enterprise Architecture", title: "Architecture Case Seminar", eventType: "Seminar", description: "Seminar on enterprise integration architecture.", eventDate: "2026-10-16", startTime: "11:00", endTime: "12:30", venue: "Auditorium EA", weightPercentage: 10, status: "Scheduled" },
  { semester: 2, groupNumber: 3, moduleCode: "ITM351", moduleName: "Machine Learning Fundamentals", title: "Final Practical Viva", eventType: "Viva", description: "Viva based on mini-project implementation.", eventDate: "2026-11-08", startTime: "14:00", endTime: "17:00", venue: "Data Lab 05", weightPercentage: 20, status: "Scheduled" },
  { semester: 2, groupNumber: 3, moduleCode: "ITM352", moduleName: "Mobile Application Engineering", title: "End Semester Exam", eventType: "Exam", description: "Theory and architecture exam for mobile engineering.", eventDate: "2026-11-22", startTime: "09:00", endTime: "11:00", venue: "Exam Hall 2", weightPercentage: 40, status: "Scheduled" },
];

const seedAcademicEvents = async () => {
  try {
    await connectDB();

    const moduleCodes = [...new Set(ACADEMIC_EVENTS.map((event) => event.moduleCode))];
    const modules = await Module.find({ moduleCode: { $in: moduleCodes } }).select("_id moduleCode");
    const moduleMap = new Map(modules.map((moduleDoc) => [moduleDoc.moduleCode, moduleDoc._id]));

    const operations = ACADEMIC_EVENTS.map((eventEntry) => ({
      updateOne: {
        filter: {
          semester: eventEntry.semester,
          groupNumber: eventEntry.groupNumber,
          moduleCode: eventEntry.moduleCode,
          title: eventEntry.title,
          eventDate: new Date(eventEntry.eventDate),
        },
        update: {
          $set: {
            ...eventEntry,
            eventDate: new Date(eventEntry.eventDate),
            module: moduleMap.get(eventEntry.moduleCode) || null,
          },
        },
        upsert: true,
      },
    }));

    const result = await AcademicEvent.bulkWrite(operations, { ordered: false });

    console.log("Academic events seed completed.");
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
  } catch (error) {
    console.error(`Failed to seed academic events: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedAcademicEvents();