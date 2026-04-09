import api from "./api";

export const getLecturerDashboard = async () => {
  const response = await api.get("/lecturer/dashboard");
  return response.data;
};

export const getMyModules = async () => {
  const response = await api.get("/lecturer/my-modules");
  return response.data;
};

export const getMyEvents = async (filters = {}) => {
  const response = await api.get("/lecturer/my-events", { params: filters });
  return response.data;
};

export const createEvent = async (payload) => {
  const response = await api.post("/lecturer/events", payload);
  return response.data;
};

export const updateEvent = async (id, payload) => {
  const response = await api.put(`/lecturer/events/${id}`, payload);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/lecturer/events/${id}`);
  return response.data;
};

export const getMyTimetable = async () => {
  const response = await api.get("/lecturer/my-timetable");
  return response.data;
};

export const getMyStudents = async (filters = {}) => {
  const response = await api.get("/lecturer/my-students", { params: filters });
  return response.data;
};

// ─── Materials ───────────────────────────────────────────────────────────────

export const getMaterials = async () => {
  const response = await api.get("/lecturer/materials");
  return response.data;
};

export const createMaterial = async (formData) => {
  const response = await api.post("/lecturer/materials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateMaterial = async (id, formData) => {
  const response = await api.put(`/lecturer/materials/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/lecturer/materials/${id}`);
  return response.data;
};

// ─── Exam Papers ─────────────────────────────────────────────────────────────

export const getExamPapers = async () => {
  const response = await api.get("/lecturer/exams");
  return response.data;
};

export const createExamPaper = async (formData) => {
  const response = await api.post("/lecturer/exams", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateExamPaper = async (id, formData) => {
  const response = await api.put(`/lecturer/exams/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteExamPaper = async (id) => {
  const response = await api.delete(`/lecturer/exams/${id}`);
  return response.data;
};

// ─── Coursework ──────────────────────────────────────────────────────────────

export const getCoursework = async () => {
  const response = await api.get("/lecturer/coursework");
  return response.data;
};

export const createCourseworkItem = async (formData) => {
  const response = await api.post("/lecturer/coursework", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateCourseworkItem = async (id, formData) => {
  const response = await api.put(`/lecturer/coursework/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteCourseworkItem = async (id) => {
  const response = await api.delete(`/lecturer/coursework/${id}`);
  return response.data;
};
