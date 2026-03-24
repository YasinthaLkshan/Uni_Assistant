import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import StudentProfile from "../models/StudentProfile.js";

dotenv.config();

const STUDENT_PROFILES = [
  { studentId: "IT30000101", fullName: "Nimesh Perera", semester: 1, groupNumber: 1, registrationStatus: "registered" },
  { studentId: "IT30000102", fullName: "Tharushi Fernando", semester: 1, groupNumber: 1, registrationStatus: "registered" },
  { studentId: "IT30000103", fullName: "Kavindu Jayasuriya", semester: 1, groupNumber: 1, registrationStatus: "pending" },
  { studentId: "IT30000201", fullName: "Sahan Wickramasinghe", semester: 1, groupNumber: 2, registrationStatus: "registered" },
  { studentId: "IT30000202", fullName: "Dinithi Samarasekara", semester: 1, groupNumber: 2, registrationStatus: "registered" },
  { studentId: "IT30000203", fullName: "Hashini Gunasekara", semester: 1, groupNumber: 2, registrationStatus: "pending" },
  { studentId: "IT30000301", fullName: "Raveen Alwis", semester: 1, groupNumber: 3, registrationStatus: "registered" },
  { studentId: "IT30000302", fullName: "Madhavi Senanayake", semester: 1, groupNumber: 3, registrationStatus: "registered" },
  { studentId: "IT30000303", fullName: "Ashen Rodrigo", semester: 1, groupNumber: 3, registrationStatus: "pending" },
  { studentId: "IT30000401", fullName: "Shenal Dias", semester: 2, groupNumber: 1, registrationStatus: "registered" },
  { studentId: "IT30000402", fullName: "Naduni Ekanayake", semester: 2, groupNumber: 1, registrationStatus: "registered" },
  { studentId: "IT30000403", fullName: "Yasas Mihiranga", semester: 2, groupNumber: 1, registrationStatus: "pending" },
  { studentId: "IT30000501", fullName: "Kanishka De Silva", semester: 2, groupNumber: 2, registrationStatus: "registered" },
  { studentId: "IT30000502", fullName: "Piumi Rathnayake", semester: 2, groupNumber: 2, registrationStatus: "registered" },
  { studentId: "IT30000503", fullName: "Lasith Bandara", semester: 2, groupNumber: 2, registrationStatus: "pending" },
  { studentId: "IT30000601", fullName: "Iresha Madushani", semester: 2, groupNumber: 3, registrationStatus: "registered" },
  { studentId: "IT30000602", fullName: "Rashan Hettiarachchi", semester: 2, groupNumber: 3, registrationStatus: "registered" },
  { studentId: "IT30000603", fullName: "Janudi Peris", semester: 2, groupNumber: 3, registrationStatus: "pending" },
];

const seedStudentProfiles = async () => {
  try {
    await connectDB();

    const operations = STUDENT_PROFILES.map((profile) => ({
      updateOne: {
        filter: { studentId: profile.studentId },
        update: { $set: profile },
        upsert: true,
      },
    }));

    const result = await StudentProfile.bulkWrite(operations, { ordered: false });

    console.log("Student profiles seed completed.");
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
  } catch (error) {
    console.error(`Failed to seed student profiles: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedStudentProfiles();