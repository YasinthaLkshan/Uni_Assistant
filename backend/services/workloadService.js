import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import WorkloadReport from "../models/WorkloadReport.js";
import AcademicEvent from "../models/AcademicEvent.js";
import StudentProfile from "../models/StudentProfile.js";
import Module from "../models/Module.js";
import AppError from "../utils/appError.js";
import {
  calculateWorkloadScore,
  calculateEnhancedWorkloadScore,
  determineWorkloadLevel,
  determineEnhancedWorkloadLevel,
  getStudySuggestion,
  getEnhancedStudySuggestion,
} from "../utils/workloadUtils.js";

const NOTIFICATION_COOLDOWN_MINUTES = 180;
const EXAM_ALERT_WINDOW_DAYS = 2;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Map academic event types to task types and assign urgency
const mapEventTypeToTaskType = (eventType) => {
  const type = String(eventType).toLowerCase().trim();
  if (type.includes("exam") || type.includes("test") || type.includes("viva")) return "exam";
  if (type.includes("assignment")) return "assignment";
  if (type.includes("presentation") || type.includes("seminar")) return "presentation";
  return "assignment"; // default
};

// Determine urgency level based on event type and weight
const getEventUrgency = (eventType, weightPercentage) => {
  const weight = weightPercentage || 0;
  const type = String(eventType).toLowerCase().trim();
  
  // High-weight events are always high urgency
  if (weight >= 30) return "High";
  
  // Exams and tests are higher priority
  if (type.includes("exam") || type.includes("test") || type.includes("viva")) return "High";
  
  // Medium-weight assignments
  if (weight >= 15) return "Medium";
  
  return "Medium";
};

const createNotificationIfNotRecentDuplicate = async ({ userId, message, type }) => {
  const windowStart = new Date(Date.now() - NOTIFICATION_COOLDOWN_MINUTES * 60 * 1000);

  const existingNotification = await Notification.findOne({
    user: userId,
    message,
    createdAt: { $gte: windowStart },
  }).lean();

  if (existingNotification) {
    return null;
  }

  return Notification.create({
    user: userId,
    message,
    type,
  });
};

const countExamsWithinDays = (tasks, days) => {
  const now = new Date();

  return tasks.filter((task) => {
    if (task?.type !== "exam") {
      return false;
    }

    const deadline = new Date(task.deadline);
    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / DAY_IN_MS;
    return daysUntilDeadline >= 0 && daysUntilDeadline <= days;
  }).length;
};

export const generateWorkloadReportForUser = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError("A valid user id is required", 400);
  }

  // Active tasks are tasks that are not yet completed.
  const activeTasks = await Task.find({
    user: userId,
    status: { $ne: "Completed" },
  })
    .sort({ deadline: 1 })
    .lean();

  const scoreResult = calculateWorkloadScore(activeTasks);
  const levelResult = determineWorkloadLevel(scoreResult.score);
  const suggestion = getStudySuggestion(levelResult.level);
  const examsWithin2Days = countExamsWithinDays(activeTasks, EXAM_ALERT_WINDOW_DAYS);

  const report = await WorkloadReport.create({
    user: userId,
    workloadScore: scoreResult.score,
    workloadLevel: levelResult.level,
    totalTasks: scoreResult.breakdown.upcomingTasks,
    urgentTasks: scoreResult.breakdown.urgentTasks,
    examsNear: scoreResult.breakdown.examsWithin7Days,
    calculatedAt: new Date(),
  });

  const notificationsToCreate = [];

  if (levelResult.level === "High") {
    notificationsToCreate.push({
      userId,
      type: "workload",
      message: "Your workload is high. Prioritize your most critical tasks today.",
    });
  }

  if (scoreResult.breakdown.urgentTasks > 0) {
    notificationsToCreate.push({
      userId,
      type: "deadline",
      message: "You have urgent tasks pending. Focus on due-soon items first.",
    });
  }

  if (examsWithin2Days > 0) {
    notificationsToCreate.push({
      userId,
      type: "deadline",
      message: "An exam is within 2 days. Start focused revision now.",
    });
  }

  await Promise.all(
    notificationsToCreate.map((notification) =>
      createNotificationIfNotRecentDuplicate(notification)
    )
  );

  return {
    report,
    metrics: {
      activeTasks: activeTasks.length,
      upcomingTasks: scoreResult.breakdown.upcomingTasks,
      urgentTasks: scoreResult.breakdown.urgentTasks,
      examsWithin2Days,
      examsWithin7Days: scoreResult.breakdown.examsWithin7Days,
      workloadScore: scoreResult.score,
      workloadLevel: levelResult.level,
    },
    studySuggestion: suggestion,
  };
};

export const generateEnhancedWorkloadReportForUser = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new AppError("A valid user id is required", 400);
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * DAY_IN_MS);

  // Get user's academic scope (semester, group, faculty)
  const studentProfile = await StudentProfile.findOne({ user: userId }).lean();

  if (!studentProfile) {
    console.warn(`No student profile found for user ${userId}`);
  }

  // Fetch active tasks with related data - only future deadlines
  const activeTasks = await Task.find({
    user: userId,
    status: { $ne: "Completed" },
    deadline: { $gt: now, $lte: sevenDaysFromNow },
  })
    .populate("academicEvent", "title eventType weightPercentage eventDate")
    .populate("module", "lectureHoursPerWeek tutorialHoursPerWeek labHoursPerWeek")
    .sort({ deadline: 1 })
    .lean();

  // Fetch upcoming academic events matching user's scope
  let academicEvents = [];
  if (studentProfile) {
    academicEvents = await AcademicEvent.find({
      semester: studentProfile.semester,
      groupNumber: studentProfile.groupNumber,
      eventDate: { $gt: now, $lte: sevenDaysFromNow },
    })
      .sort({ eventDate: 1 })
      .lean();

    console.log(`User ${userId} (Sem ${studentProfile.semester}, Grp ${studentProfile.groupNumber}): Found ${activeTasks.length} tasks, ${academicEvents.length} academic events`);
  }

  // Enrich tasks with academic event and module data
  const tasksWithDetails = activeTasks.map((task) => ({
    task,
    academicEvent: task.academicEvent || null,
    moduleData: task.module || null,
  }));

  // Convert academic events to task-like objects for scoring
  const linkedAcademicEventIds = new Set(
    activeTasks
      .map((task) => (task?.academicEvent && typeof task.academicEvent === "object" ? task.academicEvent._id : null))
      .filter(Boolean)
      .map((eventId) => String(eventId))
  );

  const academicEventsAsItems = academicEvents
    .filter((event) => !linkedAcademicEventIds.has(String(event._id)))
    .map((event) => {
    // Create event data structure with weight for scoring
    const eventData = {
      weightPercentage: event.weightPercentage || 0,
      title: event.title,
      eventType: event.eventType,
    };
    
      return {
        task: {
          _id: event._id,
          title: event.title,
          type: mapEventTypeToTaskType(event.eventType),
          deadline: event.eventDate,
          urgencyLevel: getEventUrgency(event.eventType, event.weightPercentage),
          status: "Not Started",
        },
        academicEvent: eventData,
        moduleData: null,
      };
    });

  // Combine both tasks and academic events
  const uniqueItems = [...tasksWithDetails, ...academicEventsAsItems];

  // Calculate enhanced score with combined items
  const enchancedScoreResult = calculateEnhancedWorkloadScore(uniqueItems);
  const enhancedLevelResult = determineEnhancedWorkloadLevel(enchancedScoreResult.score);
  const enhancedSuggestion = getEnhancedStudySuggestion(enchancedScoreResult.eventsByUrgency);

  console.log(`Workload calculation: Score=${enchancedScoreResult.score}, Level=${enhancedLevelResult.level}, Total Items=${uniqueItems.length}`);
  console.log(`Event breakdown: Critical=${enchancedScoreResult.breakdown.criticalEvents}, High=${enchancedScoreResult.breakdown.highUrgencyEvents}, Medium=${enchancedScoreResult.breakdown.mediumUrgencyEvents}, Low=${enchancedScoreResult.breakdown.lowUrgencyEvents}, ExamsNear=${enchancedScoreResult.breakdown.examsNear}`);

  // Get the most urgent event for recommendation
  let mostUrgentEvent = null;
  if (enchancedScoreResult.eventsByUrgency.critical.length > 0) {
    mostUrgentEvent = enchancedScoreResult.eventsByUrgency.critical[0];
  } else if (enchancedScoreResult.eventsByUrgency.high.length > 0) {
    mostUrgentEvent = enchancedScoreResult.eventsByUrgency.high[0];
  } else if (enchancedScoreResult.eventsByUrgency.medium.length > 0) {
    mostUrgentEvent = enchancedScoreResult.eventsByUrgency.medium[0];
  }

  // Create notifications for critical and high urgency events
  const notificationsToCreate = [];

  if (enhancedLevelResult.level === "Critical") {
    notificationsToCreate.push({
      userId,
      type: "workload",
      message: enhancedLevelResult.recommendation,
    });
  } else if (enhancedLevelResult.level === "High") {
    notificationsToCreate.push({
      userId,
      type: "workload",
      message: enhancedLevelResult.recommendation,
    });
  }

  if (enchancedScoreResult.breakdown.criticalEvents > 0) {
    notificationsToCreate.push({
      userId,
      type: "deadline",
      message: "Critical tasks due within 24 hours. Prioritize these immediately.",
    });
  }

  await Promise.all(
    notificationsToCreate.map((notification) =>
      createNotificationIfNotRecentDuplicate(notification)
    )
  );

  return {
    metrics: {
      activeTasks: uniqueItems.length,
      totalEvents: enchancedScoreResult.breakdown.totalEvents,
      criticalEvents: enchancedScoreResult.breakdown.criticalEvents,
      highUrgencyEvents: enchancedScoreResult.breakdown.highUrgencyEvents,
      mediumUrgencyEvents: enchancedScoreResult.breakdown.mediumUrgencyEvents,
      lowUrgencyEvents: enchancedScoreResult.breakdown.lowUrgencyEvents,
      examsNear: enchancedScoreResult.breakdown.examsNear,
      workloadScore: enchancedScoreResult.score,
      complexity: enchancedScoreResult.complexity,
    },
    workloadAnalysis: {
      level: enhancedLevelResult.level,
      intensity: enhancedLevelResult.intensity,
      score: enhancedLevelResult.score,
      recommendation: enhancedLevelResult.recommendation,
    },
    studySuggestion: enhancedSuggestion,
    mostUrgentEvent: mostUrgentEvent ? {
      taskId: mostUrgentEvent.task._id,
      title: mostUrgentEvent.task.title,
      type: mostUrgentEvent.task.type,
      deadline: mostUrgentEvent.task.deadline,
      daysLeft: Math.ceil(mostUrgentEvent.daysLeft),
      urgencyLevel: mostUrgentEvent.task.urgencyLevel,
    } : null,
    allEvents: enchancedScoreResult.eventsByUrgency,
  };
};
