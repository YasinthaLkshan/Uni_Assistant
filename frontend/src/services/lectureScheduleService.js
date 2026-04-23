import api from "./api";

export const getFullSchedule = async () => {
  const response = await api.get("/lecturer/schedule");
  return response.data;
};

export const getModuleSchedule = async (moduleId, group) => {
  const response = await api.get(`/lecturer/schedule/${moduleId}/${group}`);
  return response.data;
};

export const getScheduleSummary = async (moduleId, group) => {
  const response = await api.get(`/lecturer/schedule/${moduleId}/${group}/summary`);
  return response.data;
};

export const addSessions = async (moduleId, group, sessions) => {
  const response = await api.post(`/lecturer/schedule/${moduleId}/${group}`, { sessions });
  return response.data;
};

export const removeSession = async (sessionId) => {
  const response = await api.delete(`/lecturer/schedule/session/${sessionId}`);
  return response.data;
};

export const submitSchedule = async (moduleId, group) => {
  const response = await api.post(`/lecturer/schedule/${moduleId}/${group}/submit`);
  return response.data;
};
