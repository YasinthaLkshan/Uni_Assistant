import api from "./api";

export const listHolidays = async (filters = {}) => {
  const { data } = await api.get("/holidays", { params: filters });
  return data;
};

export const getHolidaysInRange = async (start, end) => {
  const { data } = await api.get("/holidays/range", { params: { start, end } });
  return data;
};

export const createHoliday = async (payload) => {
  const { data } = await api.post("/holidays", payload);
  return data;
};

export const updateHoliday = async (id, payload) => {
  const { data } = await api.put(`/holidays/${id}`, payload);
  return data;
};

export const deleteHoliday = async (id) => {
  const { data } = await api.delete(`/holidays/${id}`);
  return data;
};
