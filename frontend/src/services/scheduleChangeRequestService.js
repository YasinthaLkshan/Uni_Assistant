import api from "./api";

// ─── Lecturer ───────────────────────────────────────────────────────────────

export const fileChangeRequest = async (payload) => {
  const { data } = await api.post("/schedule-change-requests", payload);
  return data;
};

export const getMyChangeRequests = async () => {
  const { data } = await api.get("/schedule-change-requests/my-requests");
  return data;
};

// ─── Admin ──────────────────────────────────────────────────────────────────

export const getAllChangeRequests = async (filters = {}) => {
  const { data } = await api.get("/schedule-change-requests", { params: filters });
  return data;
};

export const approveChangeRequest = async (id, remarks = "") => {
  const { data } = await api.put(`/schedule-change-requests/${id}/approve`, { remarks });
  return data;
};

export const rejectChangeRequest = async (id, remarks = "") => {
  const { data } = await api.put(`/schedule-change-requests/${id}/reject`, { remarks });
  return data;
};
