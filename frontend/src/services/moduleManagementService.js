import api from "./api";

export const listModules = async (filters = {}) => {
  const params = {};
  if (filters.semester) params.semester = filters.semester;
  if (filters.academicYear) params.academicYear = filters.academicYear;
  if (filters.programme) params.programme = filters.programme;

  const { data } = await api.get("/admin/modules", { params });
  return data;
};

export const createModule = async (payload) => {
  const { data } = await api.post("/admin/modules", payload);
  return data;
};

export const updateModule = async (id, payload) => {
  const { data } = await api.put(`/admin/modules/${id}`, payload);
  return data;
};

export const deleteModule = async (id) => {
  const { data } = await api.delete(`/admin/modules/${id}`);
  return data;
};
