import api from "./api";

export const listLecturers = async () => {
  const response = await api.get("/admin/lecturers");
  return response.data;
};

export const createLecturer = async (payload) => {
  const response = await api.post("/admin/lecturers", payload);
  return response.data;
};

export const updateLecturer = async (id, payload) => {
  const response = await api.put(`/admin/lecturers/${id}`, payload);
  return response.data;
};

export const deleteLecturer = async (id) => {
  const response = await api.delete(`/admin/lecturers/${id}`);
  return response.data;
};
