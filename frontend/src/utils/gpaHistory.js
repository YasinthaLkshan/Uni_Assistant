const GPA_HISTORY_STORAGE_KEY_PREFIX = "uni_assistant_gpa_history_";

const getStorageKey = (userId) => {
  const safeUserId = userId || "anonymous";
  return `${GPA_HISTORY_STORAGE_KEY_PREFIX}${safeUserId}`;
};

export const loadGpaHistory = (userId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => ({
        ...entry,
        gpa: Number(entry.gpa) || 0,
        totalCredits: Number(entry.totalCredits) || 0,
      }))
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  } catch (_error) {
    return [];
  }
};

const persistHistory = (userId, history) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(history));
  } catch (_error) {
    // Ignore storage errors and keep in-memory state only.
  }
};

export const addGpaHistoryEntry = (userId, entry) => {
  const userKey = userId || "anonymous";
  const existing = loadGpaHistory(userKey);

  const normalizedEntry = {
    id: entry.id,
    gpa: Number(entry.gpa) || 0,
    totalCredits: Number(entry.totalCredits) || 0,
    semesterKey: entry.semesterKey || "",
    semesterLabel: entry.semesterLabel || "",
    courseCode: entry.courseCode || "",
    courseLabel: entry.courseLabel || "",
    createdAt: entry.createdAt || new Date().toISOString(),
  };

  const nextHistory = [normalizedEntry, ...existing].slice(0, 50);
  persistHistory(userKey, nextHistory);
  return nextHistory;
};

export const clearGpaHistory = (userId) => {
  const userKey = userId || "anonymous";
  try {
    localStorage.removeItem(getStorageKey(userKey));
  } catch (_error) {
    // Ignore
  }
  return [];
};

export const removeGpaHistoryEntry = (userId, entryId) => {
  const userKey = userId || "anonymous";
  const existing = loadGpaHistory(userKey);
  const nextHistory = existing.filter((entry) => entry.id !== entryId);
  persistHistory(userKey, nextHistory);
  return nextHistory;
};
