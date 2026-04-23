import api from "./api";

export const listProgrammes = async () => {
  const { data } = await api.get("/admin/programmes");
  return data;
};
