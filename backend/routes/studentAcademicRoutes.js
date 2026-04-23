import { Router } from "express";

import {
  getMyEventsController,
  getMyModulesController,
  getMyTimetableController,
} from "../controllers/studentAcademic.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import studentMiddleware from "../middleware/student.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Announcement from "../models/Announcement.js";
import AppError from "../utils/appError.js";

const router = Router();

router.use(protect, studentMiddleware);

router.get("/my-modules", getMyModulesController);
router.get("/my-timetable", getMyTimetableController);
router.get("/my-events", getMyEventsController);

// Student messages
router.get(
  "/messages",
  asyncHandler(async (req, res) => {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: messages });
  })
);

router.post(
  "/messages",
  asyncHandler(async (req, res) => {
    const { receiverId, subject, content, parentMessage } = req.body;

    if (!receiverId || !subject || !content) {
      throw new AppError("receiverId, subject, and content are required", 400);
    }

    const receiver = await User.findById(receiverId).select("role").lean();
    if (!receiver) throw new AppError("Receiver not found", 404);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      senderRole: "student",
      receiverRole: receiver.role,
      subject: subject.trim(),
      content: content.trim(),
      parentMessage: parentMessage || null,
    });

    res.status(201).json({ success: true, message: "Message sent", data: message });
  })
);

router.put(
  "/messages/:id/read",
  asyncHandler(async (req, res) => {
    const msg = await Message.findOne({ _id: req.params.id, receiver: req.user._id });
    if (!msg) throw new AppError("Message not found", 404);

    msg.isRead = true;
    await msg.save();

    res.status(200).json({ success: true, message: "Marked as read" });
  })
);

// Get lecturers list (for messaging)
router.get(
  "/lecturers",
  asyncHandler(async (_req, res) => {
    const lecturers = await User.find({ role: "lecturer" })
      .select("name email department")
      .sort({ name: 1 });

    res.status(200).json({ success: true, data: lecturers });
  })
);

// Get announcements for student
router.get(
  "/announcements",
  asyncHandler(async (_req, res) => {
    const announcements = await Announcement.find({})
      .populate("lecturer", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: announcements });
  })
);

export default router;
