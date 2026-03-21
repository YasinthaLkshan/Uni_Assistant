const DAY_IN_MS = 24 * 60 * 60 * 1000;

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isCompletedTask = (task) => {
  return task?.status === "Completed";
};

const isUpcomingTask = (task, now) => {
  if (!isValidDate(task?.deadline) || isCompletedTask(task)) {
    return false;
  }

  const deadline = new Date(task.deadline);
  return deadline >= now;
};

const isUrgentTask = (task, now) => {
  if (!isUpcomingTask(task, now)) {
    return false;
  }

  const deadline = new Date(task.deadline);
  const daysLeft = (deadline.getTime() - now.getTime()) / DAY_IN_MS;

  return task?.urgencyLevel === "High" || daysLeft <= 2;
};

const isExamWithin5Days = (task, now) => {
  if (!isUpcomingTask(task, now)) {
    return false;
  }

  const deadline = new Date(task.deadline);
  const daysLeft = (deadline.getTime() - now.getTime()) / DAY_IN_MS;

  return task?.type === "exam" && daysLeft <= 5;
};

export const calculateWorkloadScore = (tasks = []) => {
  const now = new Date();

  const upcomingTasks = tasks.filter((task) => isUpcomingTask(task, now)).length;
  const urgentTasks = tasks.filter((task) => isUrgentTask(task, now)).length;
  const examsWithin5Days = tasks.filter((task) => isExamWithin5Days(task, now)).length;

  const score = upcomingTasks * 2 + urgentTasks * 3 + examsWithin5Days * 5;

  return {
    score,
    breakdown: {
      upcomingTasks,
      urgentTasks,
      examsWithin5Days,
    },
    formula: "(upcomingTasks * 2) + (urgentTasks * 3) + (examsWithin5Days * 5)",
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
