import asyncHandler from "../utils/asyncHandler.js";
import {
  getPossibleExamDates,
  validateExamDate,
} from "../services/examSchedule.service.js";

export const getPossibleExamDatesController = asyncHandler(async (req, res) => {
  const { moduleId, group } = req.params;
  const result = await getPossibleExamDates(moduleId, group);

  res.status(200).json({
    success: true,
    message: "Possible exam dates fetched",
    data: result,
  });
});

export const validateExamDateController = asyncHandler(async (req, res) => {
  const { moduleId, group } = req.params;
  const { examDate } = req.body;

  await validateExamDate(moduleId, group, examDate);

  res.status(200).json({
    success: true,
    message: "Exam date is valid",
  });
});
