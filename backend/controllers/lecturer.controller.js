import asyncHandler from "../utils/asyncHandler.js";
import {
  getLecturerDashboard,
  getLecturerTimetable,
  getLecturerNotices,
  getLecturerAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getLecturerMessages,
  sendMessage,
  markMessageRead,
  getAdminList,
} from "../services/lecturer.service.js";

export const getDashboardController = asyncHandler(async (req, res) => {
  const data = await getLecturerDashboard(req.user._id);
  res.status(200).json({ success: true, data });
});

export const getMyTimetableController = asyncHandler(async (req, res) => {
  const timetable = await getLecturerTimetable(req.user._id);
  res.status(200).json({ success: true, data: timetable });
});

export const getNoticesController = asyncHandler(async (req, res) => {
  const notices = await getLecturerNotices();
  res.status(200).json({ success: true, data: notices });
});

// ─── Announcements ──────────────────────────────────────────────────────────

export const getAnnouncementsController = asyncHandler(async (req, res) => {
  const announcements = await getLecturerAnnouncements(req.user._id);
  res.status(200).json({ success: true, data: announcements });
});

export const createAnnouncementController = asyncHandler(async (req, res) => {
  const announcement = await createAnnouncement(req.user._id, req.body);
  res.status(201).json({ success: true, message: "Announcement posted", data: announcement });
});

export const deleteAnnouncementController = asyncHandler(async (req, res) => {
  await deleteAnnouncement(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Announcement deleted" });
});

// ─── Messages ───────────────────────────────────────────────────────────────

export const getMessagesController = asyncHandler(async (req, res) => {
  const messages = await getLecturerMessages(req.user._id);
  res.status(200).json({ success: true, data: messages });
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const message = await sendMessage(req.user._id, "lecturer", req.body);
  res.status(201).json({ success: true, message: "Message sent", data: message });
});

export const markMessageReadController = asyncHandler(async (req, res) => {
  await markMessageRead(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Message marked as read" });
});

export const getAdminListController = asyncHandler(async (_req, res) => {
  const admins = await getAdminList();
  res.status(200).json({ success: true, data: admins });
});
