import api from "./api";

export const getMyModules = async () => {
  const { data } = await api.get("/student/my-modules");
  return data;
};

export const getMyTimetable = async () => {
  const { data } = await api.get("/student/my-timetable");
  return data;
};

export const getMyEvents = async () => {
  const { data } = await api.get("/student/my-events");
  return data;
};
