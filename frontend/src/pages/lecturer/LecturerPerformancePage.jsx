import { useEffect, useState } from "react";

import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/error";

// ─── Shared helpers ──────────────────────────────────────────────────────────

const RECOMMENDATION_STYLES = {
  critical: { bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.3)", color: "#ef4444", icon: "!!" },
  warning:  { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.3)", color: "#fbbf24", icon: "!" },
  success:  { bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.3)",  color: "#22c55e", icon: "✓" },
  info:     { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.3)", color: "#818cf8", icon: "i" },
};

const rateColor = (r) => {
  if (r === null || r === undefined) return "#94a3b8";
  if (r >= 80) return "#22c55e";
  if (r >= 60) return "#fbbf24";
  return "#ef4444";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AttendanceBar = ({ label, rate, sessions }) => (
  <div style={{ marginBottom: "1rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", marginBottom: "0.3rem" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ color: rateColor(rate), fontWeight: 700 }}>
        {rate !== null ? `${rate}%` : "No data"}
        {sessions > 0 && <span style={{ opacity: 0.5, fontWeight: 400, marginLeft: "0.4rem" }}>({sessions} session{sessions !== 1 ? "s" : ""})</span>}
      </span>
    </div>
    <div style={{ height: "8px", background: "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
      {rate !== null && (
        <div style={{
          width: `${rate}%`,
          height: "100%",
          background: rateColor(rate),
          borderRadius: "99px",
          transition: "width 0.7s ease",
        }} />
      )}
    </div>
  </div>
);

const DayChart = ({ dayAnalysis }) => {
  if (!dayAnalysis || dayAnalysis.length === 0)
    return <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>No attendance data for day analysis.</p>;

  return (
    <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-end", flexWrap: "wrap" }}>
      {dayAnalysis.map(({ day, attendanceRate }) => {
        const h = attendanceRate !== null ? Math.max(20, Math.round(attendanceRate * 1.2)) : 20;
        const color = rateColor(attendanceRate);
        return (
          <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", flex: "1 1 50px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{attendanceRate !== null ? `${attendanceRate}%` : "–"}</span>
            <div style={{
              width: "100%",
              height: `${h}px`,
              background: color,
              borderRadius: "5px 5px 0 0",
              opacity: 0.8,
              minWidth: "30px",
            }} />
            <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>{day.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
};

const TrendBadge = ({ trend }) => {
  const map = {
    improving: { color: "#22c55e", label: "Improving ↑" },
    declining:  { color: "#ef4444", label: "Declining ↓" },
    stable:     { color: "#94a3b8", label: "Stable →" },
    "no data":  { color: "#64748b", label: "No data" },
  };
  const s = map[trend] || map["no data"];
  return (
    <span style={{
      fontSize: "0.72rem",
      fontWeight: 600,
      color: s.color,
      background: `${s.color}18`,
      padding: "0.15rem 0.5rem",
      borderRadius: "6px",
    }}>
      {s.label}
    </span>
  );
};

// ─── Insights Tab ─────────────────────────────────────────────────────────────

const InsightsTab = ({ dashboard }) => {
  const d = dashboard;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.2rem" }}>

      {/* Overview stat cards */}
      <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Overview</p>
        <h2>Performance Summary</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "1rem" }}>
          {[
            { label: "Total Modules", value: d.totalModules },
            { label: "Timetable Sessions", value: d.totalEntries },
            {
              label: "Overall Attendance",
              value: d.overallAttendanceRate !== null ? `${d.overallAttendanceRate}%` : "–",
              color: rateColor(d.overallAttendanceRate),
            },
            {
              label: "Avg Feedback Rating",
              value: d.feedbackSummary.total > 0 ? `${d.feedbackSummary.averageRatings.overallRating}/5` : "–",
              color: "#fbbf24",
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: "0.7rem 0.9rem",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: color || "inherit" }}>{value}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.15rem" }}>{label}</div>
            </div>
          ))}
        </div>

        {d.mostPopular && (
          <div style={{
            marginTop: "1rem",
            padding: "0.7rem 1rem",
            borderRadius: "8px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            fontSize: "0.85rem",
          }}>
            <span style={{ opacity: 0.7 }}>Most attended: </span>
            <span style={{ fontWeight: 700, color: "#22c55e" }}>
              {d.mostPopular.moduleCode} ({d.mostPopular.rate}%)
            </span>
          </div>
        )}
      </article>

      {/* Recommendations */}
      <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Smart Insights</p>
        <h2>Recommendations</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
          {d.recommendations.map((rec, i) => {
            const s = RECOMMENDATION_STYLES[rec.type] || RECOMMENDATION_STYLES.info;
            return (
              <div key={i} style={{
                display: "flex",
                gap: "0.7rem",
                alignItems: "flex-start",
                padding: "0.75rem 0.9rem",
                borderRadius: "8px",
                background: s.bg,
                border: `1px solid ${s.border}`,
              }}>
                <span style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: s.border, color: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 900, flexShrink: 0, marginTop: "0.05rem",
                }}>
                  {s.icon}
                </span>
                <p style={{ margin: 0, fontSize: "0.86rem", lineHeight: 1.5, opacity: 0.9 }}>{rec.text}</p>
              </div>
            );
          })}
        </div>
      </article>

      {/* Attendance by module */}
      <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Attendance</p>
        <h2>By Module</h2>
        <div style={{ marginTop: "1rem" }}>
          {d.moduleStats.length === 0 ? (
            <p style={{ opacity: 0.55, fontSize: "0.88rem" }}>No attendance data recorded yet. Use the Mark Attendance tab to start tracking.</p>
          ) : (
            d.moduleStats.map((m) => (
              <div key={m.moduleCode} style={{ marginBottom: "1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{m.moduleCode}</span>
                  <TrendBadge trend={m.trend} />
                </div>
                <p style={{ fontSize: "0.75rem", opacity: 0.55, margin: "0 0 0.3rem" }}>{m.moduleName}</p>
                <AttendanceBar label="" rate={m.attendanceRate} sessions={m.totalSessions} />
              </div>
            ))
          )}
        </div>
      </article>

      {/* Day of week chart */}
      <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Trends</p>
        <h2>Attendance by Day</h2>
        <p style={{ opacity: 0.65, fontSize: "0.83rem", marginBottom: "1rem" }}>
          Which day has the best & worst attendance.
        </p>
        <DayChart dayAnalysis={d.dayAnalysis} />
      </article>

      {/* Feedback integration */}
      {d.feedbackSummary.total > 0 && (
        <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem", gridColumn: "1 / -1" }}>
          <p className="eyebrow">Student Feedback</p>
          <h2>Feedback Ratings Snapshot</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.8rem", marginTop: "1rem" }}>
            {[
              { label: "Overall Rating", value: d.feedbackSummary.averageRatings.overallRating },
              { label: "Teaching Quality", value: d.feedbackSummary.averageRatings.teachingQuality },
              { label: "Content Clarity", value: d.feedbackSummary.averageRatings.contentClarity },
              { label: "Engagement Level", value: d.feedbackSummary.averageRatings.engagementLevel },
            ].map(({ label, value }) => {
              const color = value >= 4 ? "#22c55e" : value >= 3 ? "#fbbf24" : "#ef4444";
              const stars = Math.round(value);
              return (
                <div key={label} style={{
                  padding: "0.8rem",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color }}>{value}</div>
                  <div style={{ color: "#fbbf24", fontSize: "0.9rem", margin: "0.2rem 0" }}>
                    {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>{label}</div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "0.78rem", opacity: 0.5, marginTop: "0.8rem" }}>
            Based on {d.feedbackSummary.total} student response{d.feedbackSummary.total !== 1 ? "s" : ""}
          </p>
        </article>
      )}
    </div>
  );
};

// ─── Mark Attendance Tab ──────────────────────────────────────────────────────

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MarkAttendanceTab = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingErr, setLoadingErr] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get("/performance/sessions");
        const sorted = [...(data.data || [])].sort((a, b) => {
          const da = DAY_ORDER.indexOf(a.dayOfWeek);
          const db = DAY_ORDER.indexOf(b.dayOfWeek);
          if (da !== db) return da - db;
          return (a.startTime || "").localeCompare(b.startTime || "");
        });
        setSessions(sorted);
      } catch (err) {
        setLoadingErr(extractApiErrorMessage(err));
      }
    };
    fetchSessions();
  }, []);

  const loadStudents = async () => {
    if (!selectedEntry || !selectedDate) return;
    try {
      setLoadingStudents(true);
      setLoadingErr("");
      setSaveMsg("");
      setSaveErr("");
      const { data } = await api.get(`/performance/sessions/${selectedEntry}/${selectedDate}`);
      // Set default "Present" for any not-yet-marked student
      const withDefaults = (data.data.students || []).map((s) => ({
        ...s,
        status: s.status || "Present",
      }));
      setStudents(withDefaults);
    } catch (err) {
      setLoadingErr(extractApiErrorMessage(err));
    } finally {
      setLoadingStudents(false);
    }
  };

  const setStatus = (id, status) => {
    setStudents((prev) => prev.map((s) => (String(s._id) === String(id) ? { ...s, status } : s)));
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    if (!selectedEntry || !selectedDate || students.length === 0) return;
    try {
      setSaving(true);
      setSaveErr("");
      setSaveMsg("");
      await api.post("/performance/attendance/mark", {
        entryId: selectedEntry,
        date: selectedDate,
        records: students.map((s) => ({ studentId: s._id, status: s.status })),
      });
      setSaveMsg(`Attendance saved for ${students.length} students.`);
    } catch (err) {
      setSaveErr(extractApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const STATUS_COLORS = {
    Present: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", color: "#22c55e" },
    Late:    { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.35)", color: "#fbbf24" },
    Absent:  { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)",  color: "#ef4444" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.2rem" }}>
      {/* Session selector */}
      <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Setup</p>
        <h2>Select Session</h2>

        {loadingErr && !loadingStudents && <p className="form-error">{loadingErr}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Timetable Session</span>
            <select
              value={selectedEntry}
              onChange={(e) => { setSelectedEntry(e.target.value); setStudents([]); }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "0.6rem 0.8rem",
                color: "inherit",
                fontSize: "0.88rem",
              }}
            >
              <option value="">Select a session...</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.moduleCode} — {s.dayOfWeek} {s.startTime}–{s.endTime} ({s.activityType}) Grp {s.groupNumber}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setStudents([]); }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "0.6rem 0.8rem",
                color: "inherit",
                fontSize: "0.88rem",
              }}
            />
          </label>

          <button
            type="button"
            className="primary-btn"
            onClick={loadStudents}
            disabled={!selectedEntry || !selectedDate || loadingStudents}
          >
            {loadingStudents ? "Loading..." : "Load Students"}
          </button>
        </div>
      </article>

      {/* Student attendance list */}
      {students.length > 0 && (
        <article className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
          <p className="eyebrow">Mark Attendance</p>
          <h2>Students ({students.length})</h2>

          {/* Bulk actions */}
          <div style={{ display: "flex", gap: "0.5rem", margin: "0.8rem 0 1rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", opacity: 0.6, alignSelf: "center" }}>Mark all as:</span>
            {["Present", "Late", "Absent"].map((status) => {
              const sc = STATUS_COLORS[status];
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => markAll(status)}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "6px",
                    border: `1px solid ${sc.border}`,
                    background: sc.bg,
                    color: sc.color,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
            {students.map((s) => {
              const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Present;
              return (
                <div key={s._id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "8px",
                  background: sc.bg,
                  border: `1px solid ${sc.border}`,
                  gap: "0.5rem",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: "0.73rem", opacity: 0.55 }}>{s.studentId}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                    {["Present", "Late", "Absent"].map((status) => {
                      const bc = STATUS_COLORS[status];
                      const active = s.status === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatus(s._id, status)}
                          style={{
                            padding: "0.25rem 0.55rem",
                            borderRadius: "5px",
                            border: `1px solid ${active ? bc.border : "rgba(255,255,255,0.1)"}`,
                            background: active ? bc.bg : "transparent",
                            color: active ? bc.color : "rgba(255,255,255,0.4)",
                            fontSize: "0.72rem",
                            fontWeight: active ? 700 : 400,
                            cursor: "pointer",
                            transition: "all 0.12s",
                          }}
                        >
                          {status === "Present" ? "P" : status === "Late" ? "L" : "A"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {loadingErr && <p className="form-error" style={{ marginTop: "0.8rem" }}>{loadingErr}</p>}
          {saveErr && <p className="form-error" style={{ marginTop: "0.8rem" }}>{saveErr}</p>}
          {saveMsg && (
            <p style={{
              marginTop: "0.8rem",
              padding: "0.6rem 0.9rem",
              borderRadius: "8px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#22c55e",
              fontSize: "0.85rem",
            }}>
              {saveMsg}
            </p>
          )}

          <button
            type="button"
            className="primary-btn"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: "1rem", width: "100%" }}
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </article>
      )}

      {students.length === 0 && selectedEntry && !loadingStudents && (
        <div className="admin-glass-card" style={{ padding: "1.2rem 1.4rem" }}>
          <p style={{ opacity: 0.6, fontSize: "0.88rem" }}>
            Click "Load Students" to see the student list for this session.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const LecturerPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("insights");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/performance/dashboard");
        setDashboard(data.data);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const TABS = [
    { key: "insights", label: "Performance Insights" },
    { key: "attendance", label: "Mark Attendance" },
  ];

  return (
    <section className="section-entrance" style={{ padding: "0" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex",
        gap: "0.3rem",
        marginBottom: "1.2rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "0",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px 8px 0 0",
              border: "none",
              background: activeTab === tab.key ? "rgba(99,102,241,0.15)" : "transparent",
              color: activeTab === tab.key ? "#818cf8" : "rgba(255,255,255,0.5)",
              fontWeight: activeTab === tab.key ? 700 : 400,
              fontSize: "0.9rem",
              cursor: "pointer",
              borderBottom: activeTab === tab.key ? "2px solid #818cf8" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "insights" && (
        <>
          {loading && (
            <div className="admin-glass-card" style={{ padding: "1.4rem" }}>
              <p>Loading performance data...</p>
            </div>
          )}
          {!loading && error && (
            <div className="admin-glass-card" style={{ padding: "1.4rem" }}>
              <p className="form-error">{error}</p>
            </div>
          )}
          {!loading && !error && dashboard && <InsightsTab dashboard={dashboard} />}
        </>
      )}

      {activeTab === "attendance" && <MarkAttendanceTab />}
    </section>
  );
};

export default LecturerPerformancePage;
