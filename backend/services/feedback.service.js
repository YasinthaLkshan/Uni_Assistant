import Feedback from "../models/Feedback.js";
import Module from "../models/Module.js";
import AppError from "../utils/appError.js";
import { resolveStudentScope, scopeQuery } from "./studentAcademic.service.js";

// ─── Sentiment Analysis ──────────────────────────────────────────────────────

const POSITIVE_WORDS = [
  "good", "great", "excellent", "amazing", "helpful", "clear", "fantastic",
  "love", "best", "wonderful", "engaging", "interesting", "understandable",
  "effective", "outstanding", "brilliant", "perfect", "awesome", "enjoyed",
  "thorough", "organized", "well", "improve", "improved",
];

const NEGATIVE_WORDS = [
  "bad", "terrible", "poor", "boring", "confusing", "unclear", "difficult",
  "unhelpful", "worst", "awful", "slow", "fast", "hard", "rush", "rushed",
  "monotone", "disorganized", "unorganized", "lost", "complicated", "not",
  "never", "lack", "lacking", "missing", "disappointed",
];

const analyzeSentiment = (comment, avgRating) => {
  // Use rating as primary signal
  if (!comment || comment.trim().length === 0) {
    if (avgRating >= 4) return "positive";
    if (avgRating <= 2) return "negative";
    return "neutral";
  }

  const lower = comment.toLowerCase();
  const words = lower.split(/\s+/);

  let score = 0;
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    if (POSITIVE_WORDS.includes(clean)) score += 1;
    if (NEGATIVE_WORDS.includes(clean)) score -= 1;
  }

  // Blend with rating signal
  if (avgRating >= 4) score += 1;
  if (avgRating <= 2) score -= 1;

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
};

// ─── Smart Insights ──────────────────────────────────────────────────────────

const generateInsights = (avgRatings, sentimentBreakdown, total) => {
  const insights = [];

  if (total === 0) return insights;

  const { overallRating, teachingQuality, contentClarity, engagementLevel } = avgRatings;

  // Content clarity
  if (contentClarity < 2.5) {
    insights.push({ type: "warning", text: "Students find the lecture content hard to follow. Consider simplifying explanations." });
  } else if (contentClarity >= 4.2) {
    insights.push({ type: "success", text: "Students rate your content clarity as excellent." });
  }

  // Engagement
  if (engagementLevel < 2.5) {
    insights.push({ type: "warning", text: "Engagement is low. Interactive activities or Q&A sessions may help." });
  } else if (engagementLevel >= 4.2) {
    insights.push({ type: "success", text: "Students find your lectures highly engaging." });
  }

  // Teaching quality
  if (teachingQuality < 2.5) {
    insights.push({ type: "warning", text: "Teaching quality scores are below average. Consider adjusting delivery pace." });
  } else if (teachingQuality >= 4.5) {
    insights.push({ type: "success", text: "Your teaching quality is rated outstanding by students." });
  }

  // Sentiment
  const negPct = total > 0 ? (sentimentBreakdown.negative / total) * 100 : 0;
  const posPct = total > 0 ? (sentimentBreakdown.positive / total) * 100 : 0;

  if (negPct >= 50) {
    insights.push({ type: "warning", text: "More than half of student feedback carries a negative sentiment. Review comments for patterns." });
  } else if (posPct >= 70) {
    insights.push({ type: "success", text: "Strong positive sentiment across student feedback." });
  }

  // Overall
  if (overallRating < 2.5) {
    insights.push({ type: "warning", text: "Overall satisfaction is low. Consider scheduling a student consultation session." });
  } else if (overallRating >= 4.5) {
    insights.push({ type: "success", text: "Students are highly satisfied overall." });
  }

  if (insights.length === 0) {
    insights.push({ type: "info", text: "Feedback scores are in the average range. Keep up the good work!" });
  }

  return insights;
};

// ─── Submit Feedback ─────────────────────────────────────────────────────────

export const submitFeedback = async (studentId, payload) => {
  const {
    lecturerId,
    moduleCode,
    moduleName,
    overallRating,
    teachingQuality,
    contentClarity,
    engagementLevel,
    comment,
    isAnonymous,
  } = payload;

  if (!lecturerId || !moduleCode || !overallRating || !teachingQuality || !contentClarity || !engagementLevel) {
    throw new AppError("lecturerId, moduleCode, and all ratings are required", 400);
  }

  const ratings = [overallRating, teachingQuality, contentClarity, engagementLevel].map(Number);
  if (ratings.some((r) => r < 1 || r > 5 || isNaN(r))) {
    throw new AppError("All ratings must be between 1 and 5", 400);
  }

  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const sentiment = analyzeSentiment(comment || "", avgRating);

  // Upsert: one feedback per student per module per lecturer
  const existing = await Feedback.findOne({
    student: studentId,
    lecturer: lecturerId,
    moduleCode: moduleCode.trim().toUpperCase(),
  });

  if (existing) {
    throw new AppError("You have already submitted feedback for this module.", 409);
  }

  const feedback = await Feedback.create({
    student: studentId,
    lecturer: lecturerId,
    moduleCode: moduleCode.trim().toUpperCase(),
    moduleName: moduleName || "",
    overallRating: Number(overallRating),
    teachingQuality: Number(teachingQuality),
    contentClarity: Number(contentClarity),
    engagementLevel: Number(engagementLevel),
    comment: (comment || "").trim(),
    sentiment,
    isAnonymous: isAnonymous !== false,
  });

  return feedback;
};

// ─── Get My Submitted Feedback (Student) ─────────────────────────────────────

export const getMyFeedback = async (studentId) => {
  const feedbacks = await Feedback.find({ student: studentId })
    .populate("lecturer", "name")
    .sort({ createdAt: -1 })
    .lean();

  return feedbacks;
};

// ─── Get Lecturer Feedback Summary ───────────────────────────────────────────

export const getLecturerFeedbackSummary = async (lecturerId) => {
  const feedbacks = await Feedback.find({ lecturer: lecturerId })
    .populate("student", "name studentId")
    .sort({ createdAt: -1 })
    .lean();

  const total = feedbacks.length;

  if (total === 0) {
    return {
      total: 0,
      averageRatings: { overallRating: 0, teachingQuality: 0, contentClarity: 0, engagementLevel: 0 },
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      byModule: [],
      recentComments: [],
      insights: [],
    };
  }

  // Aggregate averages
  const sum = feedbacks.reduce(
    (acc, f) => ({
      overallRating: acc.overallRating + f.overallRating,
      teachingQuality: acc.teachingQuality + f.teachingQuality,
      contentClarity: acc.contentClarity + f.contentClarity,
      engagementLevel: acc.engagementLevel + f.engagementLevel,
    }),
    { overallRating: 0, teachingQuality: 0, contentClarity: 0, engagementLevel: 0 }
  );

  const avg = (v) => Math.round((v / total) * 10) / 10;

  const averageRatings = {
    overallRating: avg(sum.overallRating),
    teachingQuality: avg(sum.teachingQuality),
    contentClarity: avg(sum.contentClarity),
    engagementLevel: avg(sum.engagementLevel),
  };

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
  for (const f of feedbacks) {
    sentimentBreakdown[f.sentiment] = (sentimentBreakdown[f.sentiment] || 0) + 1;
  }

  // By module
  const moduleMap = {};
  for (const f of feedbacks) {
    if (!moduleMap[f.moduleCode]) {
      moduleMap[f.moduleCode] = {
        moduleCode: f.moduleCode,
        moduleName: f.moduleName || f.moduleCode,
        count: 0,
        overallRating: 0,
        teachingQuality: 0,
        contentClarity: 0,
        engagementLevel: 0,
      };
    }
    const m = moduleMap[f.moduleCode];
    m.count++;
    m.overallRating += f.overallRating;
    m.teachingQuality += f.teachingQuality;
    m.contentClarity += f.contentClarity;
    m.engagementLevel += f.engagementLevel;
  }

  const byModule = Object.values(moduleMap).map((m) => ({
    moduleCode: m.moduleCode,
    moduleName: m.moduleName,
    count: m.count,
    averageRatings: {
      overallRating: avg(m.overallRating / m.count * m.count) / m.count,
      teachingQuality: Math.round((m.teachingQuality / m.count) * 10) / 10,
      contentClarity: Math.round((m.contentClarity / m.count) * 10) / 10,
      engagementLevel: Math.round((m.engagementLevel / m.count) * 10) / 10,
      overallRatingAvg: Math.round((m.overallRating / m.count) * 10) / 10,
    },
  }));

  // Recent comments (non-empty)
  const recentComments = feedbacks
    .filter((f) => f.comment && f.comment.trim().length > 0)
    .slice(0, 10)
    .map((f) => ({
      comment: f.comment,
      sentiment: f.sentiment,
      moduleCode: f.moduleCode,
      overallRating: f.overallRating,
      studentName: f.isAnonymous ? "Anonymous" : f.student?.name || "Student",
      createdAt: f.createdAt,
    }));

  const insights = generateInsights(averageRatings, sentimentBreakdown, total);

  return {
    total,
    averageRatings,
    sentimentBreakdown,
    byModule,
    recentComments,
    insights,
  };
};

// ─── Get Modules With Lecturer Info (Student, for feedback form) ─────────────

export const getModulesForFeedback = async (user) => {
  const scope = await resolveStudentScope(user);
  const modules = await Module.find(scopeQuery(scope, false))
    .populate("lecturer", "name email")
    .populate("lecturerAssignments.lecturer", "name email")
    .sort({ moduleCode: 1 })
    .lean();

  const submittedFeedbacks = await Feedback.find({ student: user._id })
    .select("moduleCode lecturer")
    .lean();

  const submittedSet = new Set(
    submittedFeedbacks.map((f) => `${f.moduleCode}_${f.lecturer}`)
  );

  return modules.map((mod) => {
    // Find lecturer for this student's group
    const groupAssignment = (mod.lecturerAssignments || []).find(
      (a) => a.group === scope.groupNumber
    );
    const lecturer = groupAssignment?.lecturer || mod.lecturer;

    const key = lecturer ? `${mod.moduleCode}_${lecturer._id}` : null;
    const alreadySubmitted = key ? submittedSet.has(key) : false;

    return {
      moduleCode: mod.moduleCode,
      moduleName: mod.moduleName,
      lecturer: lecturer
        ? { _id: lecturer._id, name: lecturer.name }
        : null,
      alreadySubmitted,
    };
  }).filter((m) => m.lecturer !== null);
};

// ─── Get Feedback for a Specific Module (Lecturer) ───────────────────────────

export const getLecturerModuleFeedback = async (lecturerId, moduleCode) => {
  const feedbacks = await Feedback.find({
    lecturer: lecturerId,
    moduleCode: moduleCode.toUpperCase(),
  })
    .sort({ createdAt: -1 })
    .lean();

  return feedbacks.map((f) => ({
    ...f,
    studentName: f.isAnonymous ? "Anonymous" : undefined,
  }));
};
