import api from "./api";

export const getAcademicOverview = async () => {
  const { data } = await api.get("/admin/academic/overview");
  return data;
};

export const listAcademicEntity = async (entity, filters = {}) => {
  const { data } = await api.get(`/admin/academic/${entity}`, { params: filters });
  return data;
};

export const createAcademicEntity = async (entity, payload) => {
  const { data } = await api.post(`/admin/academic/${entity}`, payload);
  return data;
};

export const updateAcademicEntity = async (entity, id, payload) => {
  const { data } = await api.put(`/admin/academic/${entity}/${id}`, payload);
  return data;
};

export const deleteAcademicEntity = async (entity, id) => {
  const { data } = await api.delete(`/admin/academic/${entity}/${id}`);
  return data;
};
