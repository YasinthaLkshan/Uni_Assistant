import AcademicEvent from "../models/AcademicEvent.js";
import Announcement from "../models/Announcement.js";
import Message from "../models/Message.js";
import Module from "../models/Module.js";
import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import TimetableEntry from "../models/TimetableEntry.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const mapModuleFields = (mod) => ({
  ...mod,
  title: mod.moduleName || mod.title || "",
  groups: mod.groups || [1, 2, 3],
  credits: mod.credits || 3,
});

export const resolveLecturerModules = async (userId) => {
  const modules = await Module.find({
    $or: [
      { lecturer: userId },
      { "lecturerAssignments.lecturer": userId },
    ],
  })
    .sort({ semester: 1, moduleCode: 1 })
    .lean();

  return modules.map((mod) => {
    const mapped = mapModuleFields(mod);

    const assignedGroups = (mod.lecturerAssignments || [])
      .filter((a) => String(a.lecturer) === String(userId))
      .map((a) => a.group);

    if (assignedGroups.length > 0) {
      mapped.assignedGroups = assignedGroups;
    } else {
      mapped.assignedGroups = mapped.groups;
    }

    return mapped;
  });
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const getLecturerDashboard = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const [pendingChangeRequests, unreadMessages] = await Promise.all([
    ScheduleChangeRequest.countDocuments({ lecturer: userId, status: "pending" }),
    Message.countDocuments({ receiver: userId, isRead: false }),
  ]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];

  const todayEntries = await TimetableEntry.find({
    moduleCode: { $in: moduleCodes },
    dayOfWeek: today,
  })
    .populate("module")
    .lean();

  const sortedToday = [...todayEntries].sort((a, b) =>
    String(a.startTime || "").localeCompare(String(b.startTime || ""))
  );

  return {
    modules: modules.length,
    pendingChangeRequests,
    unreadMessages,
    todaySchedule: sortedToday,
  };
};

// ─── Timetable ──────────────────────────────────────────────────────────────

export const getLecturerTimetable = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const entries = await TimetableEntry.find({
    moduleCode: { $in: moduleCodes },
  })
    .populate("module")
    .lean();

  return [...entries].sort((a, b) => {
    const dayCompare =
      (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayCompare !== 0) return dayCompare;
    return String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });
};

// ─── Notices ────────────────────────────────────────────────────────────────

export const getLecturerNotices = async () => {
  const notices = await AcademicEvent.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return notices;
};

// ─── Announcements ──────────────────────────────────────────────────────────

export const getLecturerAnnouncements = async (userId) => {
  const announcements = await Announcement.find({ lecturer: userId })
    .sort({ createdAt: -1 })
    .lean();

  return announcements;
};

export const createAnnouncement = async (userId, payload) => {
  const { moduleCode, title, content, priority } = payload;

  if (!moduleCode || !title || !content) {
    throw new AppError("moduleCode, title, and content are required", 400);
  }

  // Verify lecturer owns this module
  const modules = await resolveLecturerModules(userId);
  const mod = modules.find((m) => m.moduleCode === moduleCode.trim().toUpperCase());

  if (!mod) {
    throw new AppError("You are not assigned to this module", 403);
  }

  const announcement = await Announcement.create({
    lecturer: userId,
    moduleCode: mod.moduleCode,
    moduleName: mod.moduleName || mod.title || "",
    title: title.trim(),
    content: content.trim(),
    priority: priority || "normal",
  });

  return announcement;
};

export const deleteAnnouncement = async (userId, announcementId) => {
  const announcement = await Announcement.findOne({
    _id: announcementId,
    lecturer: userId,
  });

  if (!announcement) {
    throw new AppError("Announcement not found or you don't have permission", 404);
  }

  await Announcement.findByIdAndDelete(announcementId);
};

// ─── Messages ───────────────────────────────────────────────────────────────

export const getLecturerMessages = async (userId) => {
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return messages;
};

export const sendMessage = async (userId, senderRole, payload) => {
  const { receiverId, subject, content, parentMessage } = payload;

  if (!receiverId || !subject || !content) {
    throw new AppError("receiverId, subject, and content are required", 400);
  }

  const receiver = await User.findById(receiverId).select("role").lean();
  if (!receiver) {
    throw new AppError("Receiver not found", 404);
  }

  const message = await Message.create({
    sender: userId,
    receiver: receiverId,
    senderRole,
    receiverRole: receiver.role,
    subject: subject.trim(),
    content: content.trim(),
    parentMessage: parentMessage || null,
  });

  return message;
};

export const markMessageRead = async (userId, messageId) => {
  const message = await Message.findOne({
    _id: messageId,
    receiver: userId,
  });

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  message.isRead = true;
  await message.save();
};

// ─── Admin List ─────────────────────────────────────────────────────────────

export const getAdminList = async () => {
  const admins = await User.find({ role: "admin" })
    .select("name email")
    .sort({ name: 1 })
    .lean();

  return admins;
};
