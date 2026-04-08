import api from "./api";

export const getPossibleExamDates = async (moduleId, group) => {
  const response = await api.get(`/lecturer/exam-schedule/${moduleId}/${group}/possible-dates`);
  return response.data;
};

export const validateExamDate = async (moduleId, group, examDate) => {
  const response = await api.post(`/lecturer/exam-schedule/${moduleId}/${group}/validate-date`, { examDate });
  return response.data;
};
