import api from "./api";

export const listTimetableEntries = async () => {
  const { data } = await api.get("/admin/timetable");
  return data;
};

export const filterTimetableEntries = async (semester, groupNumber) => {
  const { data } = await api.get(`/admin/timetable/semester/${semester}/group/${groupNumber}`);
  return data;
};

export const createTimetableEntry = async (payload) => {
  const { data } = await api.post("/admin/timetable", payload);
  return data;
};

export const updateTimetableEntry = async (id, payload) => {
  const { data } = await api.put(`/admin/timetable/${id}`, payload);
  return data;
};

export const deleteTimetableEntry = async (id) => {
  const { data } = await api.delete(`/admin/timetable/${id}`);
  return data;
};

export const duplicateTimetableToGroups = async (payload) => {
  const { data } = await api.post("/admin/timetable/duplicate-groups", payload);
  return data;
};
