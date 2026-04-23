import api from "./api";

export const getStudyAssistantDashboard = async () => {
  const { data } = await api.get("/student/study-assistant/dashboard");
  return data;
};

export const markAttendance = async (payload) => {
  const { data } = await api.post("/student/study-assistant/attendance", payload);
  return data;
};

export const markMaterialViewed = async (payload) => {
  const { data } = await api.post("/student/study-assistant/material-viewed", payload);
  return data;
};

export const markNotificationsRead = async () => {
  const { data } = await api.put("/student/study-assistant/notifications/read");
  return data;
};

export const sendMessage = async (message) => {
  const { data } = await api.post("/student/study-assistant/chat", { message });
  return data;
};

export const getChatHistory = async () => {
  const { data } = await api.get("/student/study-assistant/history");
  return data;
};

export const clearChatHistory = async () => {
  const { data } = await api.delete("/student/study-assistant/history");
  return data;
};

export const getStudyTips = async () => {
  const { data } = await api.get("/student/study-assistant/tips");
  return data;
};
