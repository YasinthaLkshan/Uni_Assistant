import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Module from "../models/Module.js";

dotenv.config();

const MODULES = [
  {
    moduleCode: "ITM301",
    moduleName: "Advanced Database Systems",
    semester: 1,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    outline: "Relational optimization, indexing strategies, distributed transactions, and NoSQL integration patterns.",
    assessmentCriteria: [
      { title: "Assignment", percentage: 20 },
      { title: "Lab Assessment", percentage: 20 },
      { title: "Final Exam", percentage: 60 },
    ],
  },
  {
    moduleCode: "ITM302",
    moduleName: "Cloud Application Development",
    semester: 1,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    outline: "Containerized deployment, CI/CD pipelines, and serverless application fundamentals.",
    assessmentCriteria: [
      { title: "Project Milestone", percentage: 25 },
      { title: "Lab Viva", percentage: 15 },
      { title: "Final Presentation", percentage: 20 },
      { title: "Final Exam", percentage: 40 },
    ],
  },
  {
    moduleCode: "ITM303",
    moduleName: "Information Security Engineering",
    semester: 1,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 1,
    outline: "Threat modeling, secure coding, cryptography basics, and security auditing techniques.",
    assessmentCriteria: [
      { title: "Spot Tests", percentage: 15 },
      { title: "Security Audit Report", percentage: 25 },
      { title: "Final Exam", percentage: 60 },
    ],
  },
  {
    moduleCode: "ITM304",
    moduleName: "Human Computer Interaction",
    semester: 1,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 2,
    labHoursPerWeek: 0,
    outline: "User research, usability testing, wireframing, and accessibility-oriented interface design.",
    assessmentCriteria: [
      { title: "Design Portfolio", percentage: 30 },
      { title: "Group Presentation", percentage: 20 },
      { title: "Final Exam", percentage: 50 },
    ],
  },
  {
    moduleCode: "ITM351",
    moduleName: "Machine Learning Fundamentals",
    semester: 2,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 1,
    outline: "Supervised learning, model evaluation, feature engineering, and practical ML workflows.",
    assessmentCriteria: [
      { title: "Coding Assignment", percentage: 20 },
      { title: "Mini Project", percentage: 30 },
      { title: "Final Exam", percentage: 50 },
    ],
  },
  {
    moduleCode: "ITM352",
    moduleName: "Mobile Application Engineering",
    semester: 2,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    outline: "Cross-platform architecture, state management, API integration, and mobile UX patterns.",
    assessmentCriteria: [
      { title: "Lab Work", percentage: 20 },
      { title: "App Project", percentage: 40 },
      { title: "Final Viva", percentage: 10 },
      { title: "Final Exam", percentage: 30 },
    ],
  },
  {
    moduleCode: "ITM353",
    moduleName: "Software Quality Assurance",
    semester: 2,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 2,
    labHoursPerWeek: 0,
    outline: "Test strategy, automation, quality metrics, and defect lifecycle management.",
    assessmentCriteria: [
      { title: "Test Plan", percentage: 20 },
      { title: "Automation Assignment", percentage: 25 },
      { title: "Final Exam", percentage: 55 },
    ],
  },
  {
    moduleCode: "ITM354",
    moduleName: "Enterprise Architecture",
    semester: 2,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 1,
    outline: "Architecture viewpoints, domain-driven decomposition, and governance in large systems.",
    assessmentCriteria: [
      { title: "Case Study", percentage: 30 },
      { title: "Seminar", percentage: 10 },
      { title: "Final Exam", percentage: 60 },
    ],
  },
];

const seedModules = async () => {
  try {
    await connectDB();

    const operations = MODULES.map((moduleEntry) => ({
      updateOne: {
        filter: { moduleCode: moduleEntry.moduleCode },
        update: { $set: moduleEntry },
        upsert: true,
      },
    }));

    const result = await Module.bulkWrite(operations, { ordered: false });

    console.log("Modules seed completed.");
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
  } catch (error) {
    console.error(`Failed to seed modules: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedModules();