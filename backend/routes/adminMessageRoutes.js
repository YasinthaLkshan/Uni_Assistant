import { Router } from "express";

import Message from "../models/Message.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

const router = Router();

router.use(protect, adminMiddleware);

// Get all messages for admin
router.get(
  "/",
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

// Send message (admin reply)
router.post(
  "/",
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
      senderRole: "admin",
      receiverRole: receiver.role,
      subject: subject.trim(),
      content: content.trim(),
      parentMessage: parentMessage || null,
    });

    res.status(201).json({ success: true, message: "Message sent", data: message });
  })
);

// Mark message as read
router.put(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const msg = await Message.findOne({ _id: req.params.id, receiver: req.user._id });
    if (!msg) throw new AppError("Message not found", 404);

    msg.isRead = true;
    await msg.save();

    res.status(200).json({ success: true, message: "Marked as read" });
  })
);

export default router;
