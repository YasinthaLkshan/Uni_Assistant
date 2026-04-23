import { useCallback, useEffect, useMemo, useState } from "react";

import { getMyModules } from "../../services/lecturerService";
import {
  addSessions,
  getModuleSchedule,
  getScheduleSummary,
  removeSession,
  submitSchedule,
} from "../../services/lectureScheduleService";
import { getHolidaysInRange } from "../../services/holidayService";
import { extractApiErrorMessage } from "../../utils/error";

const TIME_SLOTS = [
  { slot: 1, label: "9:00 AM – 11:00 AM" },
  { slot: 2, label: "11:30 AM – 1:30 PM" },
  { slot: 3, label: "2:00 PM – 4:00 PM" },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  const startPad = firstDay.getDay();
  for (let i = 0; i < startPad; i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const LecturerSchedulePage = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Holidays
  const [holidays, setHolidays] = useState([]);

  // Add session form
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedType, setSelectedType] = useState("theory");
  const [adding, setAdding] = useState(false);

  const selectedModule = useMemo(() => {
    return modules.find((m) => m._id === selectedModuleId) || null;
  }, [modules, selectedModuleId]);

  const availableGroups = useMemo(() => {
    if (!selectedModule) return [];
    return selectedModule.assignedGroups || selectedModule.groups || [1, 2, 3];
  }, [selectedModule]);

  const calendarDays = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth]);

  const sessionDateMap = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      const key = formatDate(new Date(s.date));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [sessions]);

  const holidayMap = useMemo(() => {
    const map = {};
    for (const h of holidays) {
      const key = formatDate(new Date(h.date));
      map[key] = h;
    }
    return map;
  }, [holidays]);

  // Load modules on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyModules();
        setModules(res.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      }
    };
    fetch();
  }, []);

  // Load holidays when calendar month changes
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const start = formatDate(new Date(calYear, calMonth, 1));
        const end = formatDate(new Date(calYear, calMonth + 1, 0));
        const res = await getHolidaysInRange(start, end);
        setHolidays(res.data || []);
      } catch {
        // Non-critical
      }
    };
    fetchHolidays();
  }, [calYear, calMonth]);

  const loadScheduleData = useCallback(async () => {
    if (!selectedModuleId || !selectedGroup) return;
    try {
      setLoading(true);
      setError("");
      const [summaryRes, scheduleRes] = await Promise.all([
        getScheduleSummary(selectedModuleId, selectedGroup),
        getModuleSchedule(selectedModuleId, selectedGroup),
      ]);
      setSummary(summaryRes.data || null);
      setSessions(scheduleRes.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedModuleId, selectedGroup]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  const handleModuleChange = (event) => {
    setSelectedModuleId(event.target.value);
    setSelectedGroup("");
    setSummary(null);
    setSessions([]);
    setSelectedDate(null);
    setSuccess("");
  };

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
    setSummary(null);
    setSessions([]);
    setSelectedDate(null);
    setSuccess("");
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dateStr = formatDate(date);
    if (holidayMap[dateStr]) {
      setError(`${dateStr} is a holiday — ${holidayMap[dateStr].name}. No lectures allowed.`);
      return;
    }
    setSelectedDate(date);
    setSelectedSlot("");
    setError("");
    setSuccess("");
  };

  const handleAddSession = async () => {
    if (!selectedDate || !selectedSlot || !selectedType) {
      setError("Please select a date, time slot, and session type");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      const result = await addSessions(selectedModuleId, selectedGroup, [
        {
          date: formatDate(selectedDate),
          slot: Number(selectedSlot),
          type: selectedType,
        },
      ]);

      if (result.data?.errors?.length > 0) {
        setError(result.data.errors.map((e) => e.message).join("; "));
      } else {
        setSuccess("Session added");
      }

      setSelectedSlot("");
      await loadScheduleData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSession = async (sessionId) => {
    try {
      setError("");
      setSuccess("");
      await removeSession(sessionId);
      await loadScheduleData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");
      const result = await submitSchedule(selectedModuleId, selectedGroup);
      setSuccess(result.message);
      await loadScheduleData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const theoryProgress = summary
    ? Math.min(100, Math.round((summary.scheduled.theory / Math.max(summary.required.theoryTotal, 1)) * 100))
    : 0;
  const labProgress = summary
    ? Math.min(100, Math.round((summary.scheduled.lab / Math.max(summary.required.labTotal, 1)) * 100))
    : 0;

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecture Scheduling</p>
        <h2>Schedule Your Lectures</h2>
        <p>Select a module and group, then pick dates and time slots for the semester.</p>

        {/* Module & Group Selection */}
        <h3 className="admin-subsection-title">Select Module & Group</h3>
        <div className="admin-filter-row">
          <label>
            Module
            <select value={selectedModuleId} onChange={handleModuleChange}>
              <option value="">Select Module</option>
              {modules.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.moduleCode} - {m.title || m.moduleName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Group
            <select value={selectedGroup} onChange={handleGroupChange} disabled={!selectedModuleId}>
              <option value="">Select Group</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>Group {g}</option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        {/* Hours Summary */}
        {summary && selectedModuleId && selectedGroup ? (
          <>
            <h3 className="admin-subsection-title">Hours Progress</h3>
            <div className="admin-filter-row" style={{ gap: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                  <strong>Theory:</strong> {summary.scheduled.theory} / {summary.required.theoryTotal} sessions
                  {summary.remaining.theory > 0 ? ` (${summary.remaining.theory} remaining)` : " ✓"}
                </p>
                <div style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  height: "10px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${theoryProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                    borderRadius: "6px",
                    transition: "width 0.3s ease",
                  }} />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                  <strong>Lab:</strong> {summary.scheduled.lab} / {summary.required.labTotal} sessions
                  {summary.remaining.lab > 0 ? ` (${summary.remaining.lab} remaining)` : " ✓"}
                </p>
                <div style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  height: "10px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${labProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                    borderRadius: "6px",
                    transition: "width 0.3s ease",
                  }} />
                </div>
              </div>
            </div>

            {summary.isComplete ? (
              <div style={{ marginTop: "0.8rem" }}>
                <p className="admin-action-note">All required sessions scheduled!</p>
                {sessions.some((s) => s.status === "draft") ? (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSubmit}
                    style={{ marginTop: "0.5rem" }}
                  >
                    Submit Schedule
                  </button>
                ) : (
                  <p style={{ fontSize: "0.85rem", marginTop: "0.3rem", opacity: 0.7 }}>
                    Schedule already submitted.
                  </p>
                )}
              </div>
            ) : null}

            {/* Calendar */}
            <h3 className="admin-subsection-title">Pick Dates</h3>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
              <button type="button" className="ghost-btn" onClick={prevMonth}>←</button>
              <h4 style={{ margin: 0, minWidth: "160px", textAlign: "center" }}>
                {MONTH_NAMES[calMonth]} {calYear}
              </h4>
              <button type="button" className="ghost-btn" onClick={nextMonth}>→</button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
              marginBottom: "1rem",
            }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} style={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  padding: "0.4rem 0",
                  opacity: 0.6,
                }}>
                  {d}
                </div>
              ))}

              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} />;
                }

                const dateStr = formatDate(date);
                const daySessions = sessionDateMap[dateStr] || [];
                const holiday = holidayMap[dateStr] || null;
                const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
                const isToday = formatDate(now) === dateStr;
                const isBlocked = !!holiday;

                return (
                  <button
                    type="button"
                    key={dateStr}
                    onClick={() => handleDateClick(date)}
                    disabled={isBlocked}
                    title={holiday ? `${holiday.name} (${holiday.type})` : ""}
                    style={{
                      padding: "0.35rem 0.2rem",
                      minHeight: "48px",
                      border: isSelected ? "2px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "6px",
                      background: holiday
                        ? "rgba(239,68,68,0.12)"
                        : isSelected
                          ? "rgba(59,130,246,0.15)"
                          : daySessions.length > 0
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(255,255,255,0.04)",
                      cursor: isBlocked ? "default" : "pointer",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      color: "inherit",
                      position: "relative",
                    }}
                  >
                    <span style={{
                      fontWeight: isToday ? 700 : 400,
                      textDecoration: isToday ? "underline" : "none",
                      color: holiday ? "#ef4444" : "inherit",
                    }}>
                      {date.getDate()}
                    </span>
                    {holiday ? (
                      <div style={{ fontSize: "0.55rem", lineHeight: 1.1, marginTop: "1px", color: "#ef4444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {holiday.name}
                      </div>
                    ) : null}
                    {daySessions.length > 0 ? (
                      <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginTop: "2px" }}>
                        {daySessions.map((s) => (
                          <span
                            key={s._id}
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: s.type === "theory" ? "#3b82f6" : "#10b981",
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Slot Picker */}
            {selectedDate ? (
              <div style={{
                padding: "1rem",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "1rem",
              }}>
                <p style={{ marginBottom: "0.6rem", fontWeight: 600 }}>
                  {DAYS_OF_WEEK[selectedDate.getDay()]}, {formatDate(selectedDate)}
                </p>

                <div className="admin-filter-row">
                  <label>
                    Time Slot
                    <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                      <option value="">Select Slot</option>
                      {TIME_SLOTS.map((ts) => {
                        const dateStr = formatDate(selectedDate);
                        const taken = (sessionDateMap[dateStr] || []).some((s) => s.slot === ts.slot);
                        return (
                          <option key={ts.slot} value={ts.slot} disabled={taken}>
                            Slot {ts.slot}: {ts.label} {taken ? "(taken)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label>
                    Session Type
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                      <option value="theory">Theory</option>
                      <option value="lab">Lab</option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleAddSession}
                  disabled={adding || !selectedSlot}
                  style={{ marginTop: "0.6rem" }}
                >
                  {adding ? "Adding..." : "Add Session"}
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>Click a date on the calendar to add sessions.</p>
            )}

            {/* Scheduled Sessions Table */}
            <h3 className="admin-subsection-title">Scheduled Sessions ({sessions.length})</h3>

            <div className="admin-data-table-wrap">
              {loading ? <p>Loading schedule...</p> : null}
              {!loading && sessions.length === 0 ? <p>No sessions scheduled yet.</p> : null}

              {!loading && sessions.length > 0 ? (
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Slot</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s._id}>
                        <td>{formatDate(new Date(s.date))}</td>
                        <td>{s.dayOfWeek}</td>
                        <td>Slot {s.slot}</td>
                        <td>{s.startTime} – {s.endTime}</td>
                        <td>
                          <span style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            background: s.type === "theory"
                              ? "rgba(59,130,246,0.15)"
                              : "rgba(16,185,129,0.15)",
                            color: s.type === "theory" ? "#60a5fa" : "#34d399",
                          }}>
                            {s.type}
                          </span>
                        </td>
                        <td>{s.status}</td>
                        <td>
                          {s.status === "draft" ? (
                            <button
                              type="button"
                              className="ui-btn is-ghost"
                              onClick={() => handleRemoveSession(s._id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </>
        ) : null}

        {selectedModuleId && !selectedGroup ? (
          <p style={{ marginTop: "1rem", opacity: 0.6 }}>Select a group to begin scheduling.</p>
        ) : null}
      </article>
    </section>
  );
};

export default LecturerSchedulePage;
