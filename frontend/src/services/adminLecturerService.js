import api from "./api";

export const listLecturers = async () => {
  const { data } = await api.get("/admin/lecturers");
  return data;
};
