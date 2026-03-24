import api from "./api";

export const listAcademicEvents = async (filters = {}) => {
  const { data } = await api.get("/admin/academic-events", { params: filters });
  return data;
};

export const createAcademicEvent = async (payload) => {
  const { data } = await api.post("/admin/academic-events", payload);
  return data;
};

export const updateAcademicEvent = async (id, payload) => {
  const { data } = await api.put(`/admin/academic-events/${id}`, payload);
  return data;
};

export const deleteAcademicEvent = async (id) => {
  const { data } = await api.delete(`/admin/academic-events/${id}`);
  return data;
};
