import mongoose from "mongoose";

import LectureSchedule from "../models/LectureSchedule.js";
import Module from "../models/Module.js";
import { isHoliday } from "./holiday.service.js";
import AppError from "../utils/appError.js";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Find the last lecture date for a module+group.
 */
export const getLastLectureDate = async (moduleId, group) => {
  const lastSession = await LectureSchedule.findOne({
    module: moduleId,
    group: Number(group),
    status: "submitted",
  }).sort({ date: -1 });

  if (!lastSession) return null;
  return lastSession.date;
};

/**
 * Calculate the exam window for a module+group.
 * Exams must be held after 1 week gap but within 2 weeks of last lecture.
 */
export const getExamWindow = async (moduleId, group) => {
  const lastDate = await getLastLectureDate(moduleId, group);
  if (!lastDate) {
    throw new AppError("No submitted lectures found for this module/group — cannot schedule exam yet", 400);
  }

  const windowStart = new Date(lastDate);
  windowStart.setDate(windowStart.getDate() + 7); // 1 week gap

  const windowEnd = new Date(lastDate);
  windowEnd.setDate(windowEnd.getDate() + 14); // within 2 weeks

  return { lastLectureDate: lastDate, windowStart, windowEnd };
};

/**
 * Get possible exam dates within the exam window.
 * Excludes holidays only.
 */
export const getPossibleExamDates = async (moduleId, group) => {
  const { lastLectureDate, windowStart, windowEnd } = await getExamWindow(moduleId, group);

  const possibleDates = [];
  const current = new Date(windowStart);

  while (current <= windowEnd) {
    const dayOfWeek = current.getDay();
    const holiday = await isHoliday(current);
    if (!holiday) {
      possibleDates.push({
        date: new Date(current),
        dayOfWeek: DAYS_OF_WEEK[dayOfWeek],
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return {
    lastLectureDate,
    windowStart,
    windowEnd,
    possibleDates,
  };
};

/**
 * Validate that an exam date falls within the allowed window.
 */
export const validateExamDate = async (moduleId, group, examDate) => {
  const { windowStart, windowEnd } = await getExamWindow(moduleId, group);
  const date = new Date(examDate);

  if (date < windowStart || date > windowEnd) {
    const fmt = (d) => d.toISOString().split("T")[0];
    throw new AppError(
      `Exam date must be between ${fmt(windowStart)} and ${fmt(windowEnd)} (1-2 weeks after last lecture)`,
      400
    );
  }

  const holiday = await isHoliday(date);
  if (holiday) {
    throw new AppError(`Exam date falls on a holiday — ${holiday.name}`, 400);
  }

  return true;
};
