import api from "./api";

// ─── Lecturer ───────────────────────────────────────────────────────────────

export const proposeViva = async (payload) => {
  const { data } = await api.post("/viva-schedule", payload);
  return data;
};

export const getMyVivas = async () => {
  const { data } = await api.get("/viva-schedule/my-vivas");
  return data;
};

export const deleteViva = async (id) => {
  const { data } = await api.delete(`/viva-schedule/${id}`);
  return data;
};

// ─── Admin ──────────────────────────────────────────────────────────────────

export const getAllVivas = async (filters = {}) => {
  const { data } = await api.get("/viva-schedule", { params: filters });
  return data;
};

export const approveViva = async (id, remarks = "") => {
  const { data } = await api.put(`/viva-schedule/${id}/approve`, { remarks });
  return data;
};

export const rejectViva = async (id, remarks = "") => {
  const { data } = await api.put(`/viva-schedule/${id}/reject`, { remarks });
  return data;
};
