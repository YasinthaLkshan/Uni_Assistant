import AcademicEvent from "../models/AcademicEvent.js";
import Module from "../models/Module.js";
import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import TimetableEntry from "../models/TimetableEntry.js";

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const mapModuleFields = (mod) => ({
  ...mod,
  title: mod.moduleName || mod.title || "",
  groups: mod.groups || [1, 2, 3],
  credits: mod.credits || 3,
});

export const resolveLecturerModules = async (userId) => {
  const modules = await Module.find({
    $or: [
      { lecturer: userId },
      { "lecturerAssignments.lecturer": userId },
    ],
  })
    .sort({ semester: 1, moduleCode: 1 })
    .lean();

  return modules.map((mod) => {
    const mapped = mapModuleFields(mod);

    const assignedGroups = (mod.lecturerAssignments || [])
      .filter((a) => String(a.lecturer) === String(userId))
      .map((a) => a.group);

    if (assignedGroups.length > 0) {
      mapped.assignedGroups = assignedGroups;
    } else {
      mapped.assignedGroups = mapped.groups;
    }

    return mapped;
  });
};

export const getLecturerDashboard = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const pendingChangeRequests = await ScheduleChangeRequest.countDocuments({
    lecturer: userId,
    status: "pending",
  });

  // Get today's timetable entries
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];

  const todayEntries = await TimetableEntry.find({
    moduleCode: { $in: moduleCodes },
    dayOfWeek: today,
  })
    .populate("module")
    .lean();

  const sortedToday = [...todayEntries].sort((a, b) =>
    String(a.startTime || "").localeCompare(String(b.startTime || ""))
  );

  return {
    modules: modules.length,
    pendingChangeRequests,
    todaySchedule: sortedToday,
  };
};

export const getLecturerTimetable = async (userId) => {
  const modules = await resolveLecturerModules(userId);
  const moduleCodes = modules.map((m) => m.moduleCode);

  const entries = await TimetableEntry.find({
    moduleCode: { $in: moduleCodes },
  })
    .populate("module")
    .lean();

  return [...entries].sort((a, b) => {
    const dayCompare =
      (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayCompare !== 0) return dayCompare;
    return String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });
};

export const getLecturerNotices = async () => {
  const notices = await AcademicEvent.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return notices;
};
