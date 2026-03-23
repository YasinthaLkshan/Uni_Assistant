import api from "./api";

export const listModules = async (filters = {}) => {
  if (filters.semester) {
    const { data } = await api.get(`/admin/modules/semester/${filters.semester}`);
    return data;
  }

  const { data } = await api.get("/admin/modules");
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
