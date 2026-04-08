import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Attendance from "../models/Attendance.js";
import AcademicEvent from "../models/AcademicEvent.js";
import Material from "../models/Material.js";
import TimetableEntry from "../models/TimetableEntry.js";
import User from "../models/User.js";

dotenv.config();

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Generate past dates for a given dayOfWeek over the last N weeks
const getPastDatesForDay = (dayName, weeks) => {
  const dayIndex = DAY_NAMES.indexOf(dayName);
  if (dayIndex === -1) return [];

  const dates = [];
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (let w = 1; w <= weeks; w++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - (7 * w) + (dayIndex - today.getDay()));
    if (d < todayStart) {
      dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  }

  return dates;
};

const run = async () => {
  try {
    await connectDB();

    // Find the test student
    const student = await User.findOne({ studentId: "IT30000201" });
    if (!student) {
      console.error("Test student IT30000201 not found. Register first.");
      process.exit(1);
    }

    console.log(`Found student: ${student.name} (${student.studentId})`);

    // Get all timetable entries for this student's scope
    const entries = await TimetableEntry.find({
      faculty: "IT",
      semester: student.semester,
      groupNumber: student.groupNumber,
      $or: [{ academicYear: 3 }, { year: 3 }],
    }).lean();

    console.log(`Found ${entries.length} timetable entries`);

    // ── Seed Attendance (last 4 weeks) ──
    // Create a realistic pattern: mostly present with some absences
    const WEEKS_BACK = 4;
    const attendanceRecords = [];

    // Define some absences per module for realism
    const absencePattern = {
      DS: [1, 3],       // absent in weeks 1 and 3 for DS sessions
      PAF: [2],         // absent in week 2 for PAF sessions
      ITPM: [1, 4],     // absent in weeks 1 and 4 for ITPM
      NDM: [3],         // absent in week 3 for NDM
    };

    for (const entry of entries) {
      const pastDates = getPastDatesForDay(entry.dayOfWeek, WEEKS_BACK);
      const moduleAbsences = absencePattern[entry.moduleName] || [];

      for (let i = 0; i < pastDates.length; i++) {
        const weekNum = i + 1;
        const isAbsent = moduleAbsences.includes(weekNum);

        attendanceRecords.push({
          user: student._id,
          timetableEntry: entry._id,
          date: pastDates[i],
          status: isAbsent ? "Absent" : "Present",
          markedAt: pastDates[i],
        });
      }
    }

    // Clear existing attendance for this student
    const deleted = await Attendance.deleteMany({ user: student._id });
    console.log(`Cleared ${deleted.deletedCount} old attendance records`);

    // Insert with ordered:false to skip duplicates
    if (attendanceRecords.length > 0) {
      const result = await Attendance.insertMany(attendanceRecords, { ordered: false }).catch((err) => {
        if (err.insertedDocs) return err.insertedDocs;
        throw err;
      });
      const count = Array.isArray(result) ? result.length : result?.insertedCount || 0;
      console.log(`Inserted ${count} attendance records`);
    }

    // ── Seed Upcoming Exams ──
    const today = new Date();
    const examData = [
      {
        moduleCode: "IT3020",
        moduleName: "DS",
        title: "DS Mid-Semester Examination",
        eventType: "Exam",
        eventDate: new Date(today.getTime() + 5 * 86400000),  // 5 days from now
        startTime: "09:00",
        endTime: "11:00",
        venue: "Main Hall A",
        weightPercentage: 30,
        description: "Covers all lectures up to Week 6",
      },
      {
        moduleCode: "IT3050",
        moduleName: "PAF",
        title: "PAF Practical Examination",
        eventType: "Exam",
        eventDate: new Date(today.getTime() + 12 * 86400000), // 12 days from now
        startTime: "13:00",
        endTime: "15:00",
        venue: "Lab G1305",
        weightPercentage: 25,
        description: "Full-stack practical exam",
      },
      {
        moduleCode: "IT3040",
        moduleName: "ITPM",
        title: "ITPM Written Exam",
        eventType: "Exam",
        eventDate: new Date(today.getTime() + 20 * 86400000), // 20 days from now
        startTime: "09:00",
        endTime: "11:00",
        venue: "Main Hall B",
        weightPercentage: 40,
        description: "Covers project management methodologies",
      },
      {
        moduleCode: "IT3010",
        moduleName: "NDM",
        title: "NDM End-Semester Examination",
        eventType: "Exam",
        eventDate: new Date(today.getTime() + 28 * 86400000), // 28 days from now
        startTime: "09:00",
        endTime: "12:00",
        venue: "Main Hall A",
        weightPercentage: 40,
        description: "Comprehensive exam covering all modules",
      },
    ];

    for (const exam of examData) {
      await AcademicEvent.findOneAndUpdate(
        {
          faculty: "IT",
          academicYear: 3,
          semester: student.semester,
          groupNumber: student.groupNumber,
          moduleCode: exam.moduleCode,
          title: exam.title,
        },
        {
          ...exam,
          faculty: "IT",
          academicYear: 3,
          year: 3,
          semester: student.semester,
          groupNumber: student.groupNumber,
          status: "Scheduled",
        },
        { upsert: true, new: true }
      );
      console.log(`Upserted exam: ${exam.title} (${exam.moduleCode}) — ${exam.eventDate.toDateString()}`);
    }

    // ── Seed Materials ──
    // Find or create a lecturer for the materials
    let lecturer = await User.findOne({ role: "lecturer" });
    if (!lecturer) {
      const hashedPw = await bcrypt.hash("Lecturer@123", 12);
      lecturer = await User.create({
        name: "Dr. Sample Lecturer",
        email: "lecturer@uni.lk",
        password: hashedPw,
        role: "lecturer",
        department: "IT",
      });
      console.log("Created sample lecturer");
    }

    const materialData = [
      // DS materials
      { moduleCode: "IT3020", moduleName: "DS", title: "Week 1 - Introduction to Data Structures", materialType: "Lecture Slides", description: "Overview of arrays, linked lists, stacks and queues" },
      { moduleCode: "IT3020", moduleName: "DS", title: "Week 2 - Trees and Binary Search Trees", materialType: "Lecture Slides", description: "Binary trees, BST operations, traversals" },
      { moduleCode: "IT3020", moduleName: "DS", title: "DS Lab Sheet 1 - Linked List Implementation", materialType: "Lab Sheet", description: "Implement singly and doubly linked lists in Java" },
      { moduleCode: "IT3020", moduleName: "DS", title: "Week 3 - Graph Algorithms", materialType: "Lecture Slides", description: "BFS, DFS, shortest path algorithms" },
      { moduleCode: "IT3020", moduleName: "DS", title: "DS Tutorial 1 - Complexity Analysis", materialType: "Tutorial", description: "Big-O notation exercises and analysis" },
      // PAF materials
      { moduleCode: "IT3050", moduleName: "PAF", title: "Week 1 - Spring Boot Fundamentals", materialType: "Lecture Slides", description: "Spring Boot setup, REST APIs, dependency injection" },
      { moduleCode: "IT3050", moduleName: "PAF", title: "Week 2 - React Frontend Basics", materialType: "Lecture Slides", description: "Components, props, state, hooks" },
      { moduleCode: "IT3050", moduleName: "PAF", title: "PAF Lab 1 - CRUD REST API", materialType: "Lab Sheet", description: "Build a CRUD REST API with Spring Boot" },
      { moduleCode: "IT3050", moduleName: "PAF", title: "Week 3 - Full-Stack Integration", materialType: "Lecture Slides", description: "Connecting React frontend to Spring Boot backend" },
      { moduleCode: "IT3050", moduleName: "PAF", title: "PAF Reading - Microservices Patterns", materialType: "Reading Material", description: "Introduction to microservices architecture" },
      // ITPM materials
      { moduleCode: "IT3040", moduleName: "ITPM", title: "Week 1 - Project Management Overview", materialType: "Lecture Slides", description: "SDLC, Agile vs Waterfall, project phases" },
      { moduleCode: "IT3040", moduleName: "ITPM", title: "Week 2 - Agile & Scrum Framework", materialType: "Lecture Slides", description: "Scrum roles, ceremonies, artifacts" },
      { moduleCode: "IT3040", moduleName: "ITPM", title: "ITPM Case Study Notes", materialType: "Notes", description: "Case study analysis of failed IT projects" },
      { moduleCode: "IT3040", moduleName: "ITPM", title: "Week 3 - Risk Management", materialType: "Lecture Slides", description: "Risk identification, assessment, mitigation strategies" },
      // NDM materials
      { moduleCode: "IT3010", moduleName: "NDM", title: "Week 1 - Network Fundamentals", materialType: "Lecture Slides", description: "OSI model, TCP/IP, network topologies" },
      { moduleCode: "IT3010", moduleName: "NDM", title: "Week 2 - Routing Protocols", materialType: "Lecture Slides", description: "RIP, OSPF, BGP routing protocols" },
      { moduleCode: "IT3010", moduleName: "NDM", title: "NDM Lab 1 - Packet Tracer Basics", materialType: "Lab Sheet", description: "Network simulation with Cisco Packet Tracer" },
      { moduleCode: "IT3010", moduleName: "NDM", title: "Week 3 - Network Security", materialType: "Lecture Slides", description: "Firewalls, VPNs, encryption protocols" },
      { moduleCode: "IT3010", moduleName: "NDM", title: "NDM Tutorial - Subnetting Exercises", materialType: "Tutorial", description: "CIDR notation and subnet calculations" },
    ];

    let materialCount = 0;
    const baseDate = new Date(today.getTime() - 21 * 86400000); // start 3 weeks ago
    for (let i = 0; i < materialData.length; i++) {
      const mat = materialData[i];
      const createdAt = new Date(baseDate.getTime() + i * 86400000 * 1.2); // spread over time
      await Material.findOneAndUpdate(
        {
          faculty: "IT",
          semester: student.semester,
          groupNumber: student.groupNumber,
          moduleCode: mat.moduleCode,
          title: mat.title,
        },
        {
          ...mat,
          faculty: "IT",
          academicYear: 3,
          semester: student.semester,
          groupNumber: student.groupNumber,
          lecturer: lecturer._id,
          fileName: `${mat.title.replace(/\s+/g, "_")}.pdf`,
          fileSize: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 9)}MB`,
          filePath: `/uploads/materials/${mat.moduleCode}/`,
          createdAt,
          updatedAt: createdAt,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      materialCount++;
    }
    console.log(`Upserted ${materialCount} materials across 4 modules`);

    // ── Summary ──
    const totalAttendance = await Attendance.countDocuments({ user: student._id });
    const presentCount = await Attendance.countDocuments({ user: student._id, status: "Present" });
    const absentCount = await Attendance.countDocuments({ user: student._id, status: "Absent" });
    const totalExams = await AcademicEvent.countDocuments({
      faculty: "IT",
      semester: student.semester,
      groupNumber: student.groupNumber,
      eventType: "Exam",
    });

    console.log("\n── Seed Summary ──");
    console.log(`Attendance records: ${totalAttendance} (${presentCount} present, ${absentCount} absent)`);
    console.log(`Overall attendance: ${Math.round((presentCount / totalAttendance) * 100)}%`);
    console.log(`Upcoming exams: ${totalExams}`);
    console.log("\nDone!");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

run();
