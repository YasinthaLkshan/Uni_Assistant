import api from "./api";

export const listStudentProfiles = async (filters = {}) => {
  const { data } = await api.get("/admin/student-profiles", { params: filters });
  return data;
};

export const createStudentProfile = async (payload) => {
  const { data } = await api.post("/admin/student-profiles", payload);
  return data;
};

export const updateStudentProfile = async (id, payload) => {
  const { data } = await api.put(`/admin/student-profiles/${id}`, payload);
  return data;
};

export const deleteStudentProfile = async (id) => {
  const { data } = await api.delete(`/admin/student-profiles/${id}`);
  return data;
};
