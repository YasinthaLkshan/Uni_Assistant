import api from "./api";

export const getStudyAssistantDashboard = async () => {
  const { data } = await api.get("/student/study-assistant/dashboard");
  return data;
};

export const getTodaysLectures = async () => {
  const { data } = await api.get("/student/study-assistant/todays-lectures");
  return data;
};

export const getExamCountdown = async () => {
  const { data } = await api.get("/student/study-assistant/exam-countdown");
  return data;
};

export const markAttendance = async (timetableEntryId, date, status) => {
  const { data } = await api.post("/student/study-assistant/attendance", {
    timetableEntryId,
    date,
    status,
  });
  return data;
};

export const getAttendanceSummary = async () => {
  const { data } = await api.get("/student/study-assistant/attendance");
  return data;
};

export const getMissedLectures = async () => {
  const { data } = await api.get("/student/study-assistant/missed-lectures");
  return data;
};

export const getPendingMaterials = async () => {
  const { data } = await api.get("/student/study-assistant/pending-materials");
  return data;
};

export const markMaterialViewed = async (materialId) => {
  const { data } = await api.post("/student/study-assistant/material-viewed", { materialId });
  return data;
};

export const getStudyStrategy = async () => {
  const { data } = await api.get("/student/study-assistant/study-strategy");
  return data;
};

export const getStudyNotifications = async () => {
  const { data } = await api.get("/student/study-assistant/notifications");
  return data;
};

export const markNotificationsRead = async () => {
  const { data } = await api.post("/student/study-assistant/notifications/mark-read");
  return data;
};
