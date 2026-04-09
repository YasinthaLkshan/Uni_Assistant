const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;

const isExamLikeType = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  return normalized.includes("exam") || normalized.includes("test") || normalized.includes("viva");
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isCompletedTask = (task) => {
  return task?.status === "Completed";
};

const isUpcomingTask = (task, now) => {
  if (isCompletedTask(task)) {
    return false;
  }

  if (!isValidDate(task?.deadline)) {
    return false;
  }

  const deadline = new Date(task.deadline);
  const deadlineTime = deadline.getTime();
  const nowTime = now.getTime();
  
  // Only return true if deadline is in the future (strictly greater than now)
  return deadlineTime > nowTime;
};

const isUrgentTask = (task, now) => {
  if (!isUpcomingTask(task, now)) {
    return false;
  }

  const deadline = new Date(task.deadline);
  const daysLeft = (deadline.getTime() - now.getTime()) / DAY_IN_MS;

  return task?.urgencyLevel === "High" || daysLeft <= 2;
};

const isExamWithin7Days = (task, now) => {
  if (!isUpcomingTask(task, now)) {
    return false;
  }

  const deadline = new Date(task.deadline);
  const daysLeft = (deadline.getTime() - now.getTime()) / DAY_IN_MS;

  return task?.type === "exam" && daysLeft <= 7;
};

// Calculate days until deadline
const getDaysUntilDeadline = (deadline) => {
  const now = new Date();
  return (new Date(deadline).getTime() - now.getTime()) / DAY_IN_MS;
};

// Get urgency multiplier based on proximity to deadline
const getUrgencyMultiplier = (daysLeft) => {
  if (daysLeft <= 1) return 5; // Very urgent (0-24 hours)
  if (daysLeft <= 2) return 4; // Urgent (24-48 hours)
  if (daysLeft <= 3) return 3; // High priority (2-3 days)
  if (daysLeft <= 5) return 2; // Medium priority (3-5 days)
  if (daysLeft <= 7) return 1.5; // Standard (5-7 days)
  return 1; // Low priority (>7 days)
};

// Calculate task complexity score
const getTaskComplexityScore = (task) => {
  let complexity = 1;
  
  // Type-based complexity
  if (task?.type === "exam") complexity += 3;
  else if (task?.type === "assignment") complexity += 2;
  else if (task?.type === "presentation") complexity += 2;
  
  // Urgency level complexity
  if (task?.urgencyLevel === "High") complexity += 2;
  else if (task?.urgencyLevel === "Medium") complexity += 1;
  
  return complexity;
};

export const calculateWorkloadScore = (tasks = []) => {
  const now = new Date();

  const upcomingTasks = tasks.filter((task) => {
    if (!isUpcomingTask(task, now)) {
      return false;
    }

    const deadline = new Date(task.deadline);
    const daysLeft = (deadline.getTime() - now.getTime()) / DAY_IN_MS;
    return daysLeft <= 7;
  }).length;
  const urgentTasks = tasks.filter((task) => isUrgentTask(task, now)).length;
  const examsWithin7Days = tasks.filter((task) => isExamWithin7Days(task, now)).length;

  const score = upcomingTasks * 2 + urgentTasks * 3 + examsWithin7Days * 5;

  return {
    score,
    breakdown: {
      upcomingTasks,
      urgentTasks,
      examsWithin7Days,
    },
    formula: "(upcomingTasks * 2) + (urgentTasks * 3) + (examsWithin7Days * 5)",
  };
};

// Enhanced workload score calculation with event details
export const calculateEnhancedWorkloadScore = (tasksWithDetails = []) => {
  const now = new Date();
  let totalScore = 0;
  let totalComplexity = 0;
  let totalUpcomingEvents = 0;
  let examsNear = 0;
  const eventsByUrgency = { critical: [], high: [], medium: [], low: [] };

  tasksWithDetails.forEach((taskDetail) => {
    const task = taskDetail.task;
    const eventType = taskDetail?.academicEvent?.eventType;
    const isExamLikeTask = isExamLikeType(task?.type) || isExamLikeType(eventType);
    
    // Double check: Skip if not upcoming
    if (!isUpcomingTask(task, now)) return;

    const daysLeft = getDaysUntilDeadline(task.deadline);
    
    // Restrict calculations to the requested 7-day window.
    if (daysLeft <= 0 || daysLeft > 7) return;

    totalUpcomingEvents += 1;

    if (isExamLikeTask) {
      examsNear += 1;
    }

    const urgencyMultiplier = getUrgencyMultiplier(daysLeft);
    const complexity = getTaskComplexityScore({
      ...task,
      type: isExamLikeTask ? "exam" : task?.type,
    });
    
    // Enhanced score calculation
    let taskScore = complexity * urgencyMultiplier;
    
    // Factor in event details if available
    if (taskDetail.academicEvent) {
      const weightFactor = (taskDetail.academicEvent.weightPercentage || 0) / 100;
      taskScore *= (1 + weightFactor);
    }
    
    // Factor in module hours if available
    if (taskDetail.moduleData) {
      const totalWeeklyHours = (taskDetail.moduleData.lectureHoursPerWeek || 0) +
                               (taskDetail.moduleData.tutorialHoursPerWeek || 0) +
                               (taskDetail.moduleData.labHoursPerWeek || 0);
      const hoursFactor = Math.min(totalWeeklyHours / 10, 1.5); // Cap at 1.5x
      taskScore *= (1 + hoursFactor * 0.3); // 30% influence
    }
    
    totalScore += taskScore;
    totalComplexity += complexity;
    
    // Categorize by urgency for smarter recommendations
    if (daysLeft <= 1) {
      eventsByUrgency.critical.push({ task, score: taskScore, daysLeft });
    } else if (daysLeft <= 2) {
      eventsByUrgency.high.push({ task, score: taskScore, daysLeft });
    } else if (daysLeft <= 5) {
      eventsByUrgency.medium.push({ task, score: taskScore, daysLeft });
    } else {
      eventsByUrgency.low.push({ task, score: taskScore, daysLeft });
    }
  });

  return {
    score: Math.round(totalScore * 10) / 10,
    complexity: Math.round(totalComplexity * 10) / 10,
    breakdown: {
      totalEvents: totalUpcomingEvents,
      criticalEvents: eventsByUrgency.critical.length,
      highUrgencyEvents: eventsByUrgency.high.length,
      mediumUrgencyEvents: eventsByUrgency.medium.length,
      lowUrgencyEvents: eventsByUrgency.low.length,
      examsNear,
    },
    eventsByUrgency,
  };
};

export const determineWorkloadLevel = (score = 0) => {
  let level = "Low";

  if (score > 10) {
    level = "High";
  } else if (score >= 5 && score <= 10) {
    level = "Medium";
  }

  return {
    score,
    level,
  };
};

// Enhanced workload level determination
export const determineEnhancedWorkloadLevel = (score = 0) => {
  let level = "Low";
  let intensity = "Manageable";
  let recommendation = "Focus on long-term preparation";

  if (score > 30) {
    level = "Critical";
    intensity = "Very High";
    recommendation = "Multiple urgent deadlines. Prioritize high-weight exams and assignments.";
  } else if (score > 20) {
    level = "High";
    intensity = "High";
    recommendation = "Several upcoming events. Create a detailed study schedule.";
  } else if (score > 10) {
    level = "Medium-High";
    intensity = "Moderate-High";
    recommendation = "Plan your revision and assignment completion strategically.";
  } else if (score >= 5) {
    level = "Medium";
    intensity = "Moderate";
    recommendation = "Maintain consistent progress on all tasks.";
  }

  return {
    score,
    level,
    intensity,
    recommendation,
  };
};

export const getStudySuggestion = (level = "Low") => {
  const normalizedLevel = String(level);

  if (normalizedLevel === "High") {
    return {
      level: "High",
      suggestedStudyHoursPerDay: "3-4 hours/day",
    };
  }

  if (normalizedLevel === "Medium") {
    return {
      level: "Medium",
      suggestedStudyHoursPerDay: "2 hours/day",
    };
  }

  return {
    level: "Low",
    suggestedStudyHoursPerDay: "1 hour/day",
  };
};

// Enhanced study suggestion based on urgency and event details
export const getEnhancedStudySuggestion = (eventsByUrgency) => {
  const criticalCount = eventsByUrgency.critical?.length || 0;
  const highCount = eventsByUrgency.high?.length || 0;
  const mediumCount = eventsByUrgency.medium?.length || 0;

  let suggestion = {};

  if (criticalCount > 0) {
    suggestion = {
      level: "Critical",
      suggestedStudyHoursPerDay: "5-6 hours/day",
      focus: "Complete critical tasks within next 24 hours",
      strategy: "Focus intensively on exam revision and assignment completion",
      breakingDownTasks: true,
    };
  } else if (highCount > 0) {
    suggestion = {
      level: "High",
      suggestedStudyHoursPerDay: "3-4 hours/day",
      focus: "Prioritize high-urgency events within next 48 hours",
      strategy: "Divide study time between different subjects/assignments",
      breakingDownTasks: true,
    };
  } else if (mediumCount > 0) {
    suggestion = {
      level: "Medium",
      suggestedStudyHoursPerDay: "2-3 hours/day",
      focus: "Prepare for events within next 5 days",
      strategy: "Consistent daily revision with structured breaks",
      breakingDownTasks: false,
    };
  } else {
    suggestion = {
      level: "Low",
      suggestedStudyHoursPerDay: "1-2 hours/day",
      focus: "Maintain long-term learning goals",
      strategy: "Regular class notes review and group study sessions",
      breakingDownTasks: false,
    };
  }

  return suggestion;
};
