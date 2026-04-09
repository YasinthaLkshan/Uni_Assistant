import api from "./api";

export const listProgrammes = async (filters = {}) => {
  if (filters.programmeType) {
    const { data } = await api.get(`/admin/programmes/type/${filters.programmeType}`);
    return data;
  }

  const { data } = await api.get("/admin/programmes");
  return data;
};

export const createProgramme = async (payload) => {
  const { data } = await api.post("/admin/programmes", payload);
  return data;
};

export const updateProgramme = async (id, payload) => {
  const { data } = await api.put(`/admin/programmes/${id}`, payload);
  return data;
};

export const deleteProgramme = async (id) => {
  const { data } = await api.delete(`/admin/programmes/${id}`);
  return data;
};
