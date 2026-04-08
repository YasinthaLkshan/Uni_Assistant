import { useCallback, useEffect, useState } from "react";

import {
  EmptyStateCard,
  GlassCard,
  LoadingSpinner,
  PageHeader,
  SecondaryButton,
  SectionTitle,
  SkeletonCard,
  StatusBadge,
} from "../components";
import { useAuth } from "../hooks/useAuth";
import {
  getStudyAssistantDashboard,
  markAttendance as markAttendanceApi,
  markMaterialViewed as markMaterialViewedApi,
  markNotificationsRead as markNotificationsReadApi,
} from "../services/studyAssistantService";
import { extractApiErrorMessage } from "../utils/error";

const TABS = [
  { key: "strategy", label: "Study Strategy" },
  { key: "lectures", label: "Today's Lectures" },
  { key: "exams", label: "Exam Countdown" },
  { key: "attendance", label: "Attendance" },
  { key: "materials", label: "Materials" },
  { key: "missed", label: "Missed Lectures" },
  { key: "notifications", label: "Notifications" },
];

const getCountdownBadge = (days) => {
  if (days <= 3) return "danger";
  if (days <= 7) return "warning";
  return "success";
};

const getAttendanceBadge = (pct) => {
  if (pct < 60) return "danger";
  if (pct < 80) return "warning";
  return "success";
};

const getPriorityBadge = (p) => {
  if (p === "High") return "danger";
  if (p === "Medium") return "warning";
  return "success";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

const StudyAssistantPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoadingShell, setShowLoadingShell] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("strategy");
  const [markingId, setMarkingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getStudyAssistantDashboard();
      setData(res.data);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (loading) { setShowLoadingShell(true); return; }
    const tid = window.setTimeout(() => setShowLoadingShell(false), 180);
    return () => window.clearTimeout(tid);
  }, [loading]);

  const handleMarkAttendance = async (entryId, status) => {
    try {
      setMarkingId(entryId);
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await markAttendanceApi(entryId, dateStr, status);
      setData((prev) => ({
        ...prev,
        todaysLectures: {
          ...prev.todaysLectures,
          items: prev.todaysLectures.items.map((item) =>
            item._id === entryId ? { ...item, attendanceStatus: status } : item
          ),
        },
      }));
      const res = await getStudyAssistantDashboard();
      setData(res.data);
    } catch { /* retry available */ } finally { setMarkingId(null); }
  };

  const handleMarkViewed = async (materialId) => {
    try {
      setViewingId(materialId);
      await markMaterialViewedApi(materialId);
      setData((prev) => ({
        ...prev,
        pendingMaterials: {
          ...prev.pendingMaterials,
          pending: prev.pendingMaterials.pending.filter((m) => m._id !== materialId),
          pendingCount: prev.pendingMaterials.pendingCount - 1,
          viewedCount: prev.pendingMaterials.viewedCount + 1,
        },
      }));
    } catch { /* retry available */ } finally { setViewingId(null); }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingRead(true);
      await markNotificationsReadApi();
      setData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          items: (prev.notifications?.items || []).map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        },
      }));
    } catch { /* retry available */ } finally { setMarkingRead(false); }
  };

  // ── Loading Shell ──
  if (showLoadingShell) {
    return (
      <section className={`study-assistant loading-shell ${loading ? "is-entering" : "is-leaving"}`.trim()}>
        <GlassCard className="section-entrance">
          <div className="dashboard-loading-copy">
            <span className="skeleton-block skeleton-eyebrow" />
            <span className="skeleton-block skeleton-hero" />
            <span className="skeleton-block skeleton-subline" />
          </div>
          <LoadingSpinner className="dashboard-inline-spinner" label="Loading study assistant..." />
        </GlassCard>
        <div className="sa-stats-row">
          <SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} />
        </div>
        <SkeletonCard className="section-entrance" lines={6} />
      </section>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <section className="study-assistant">
        <EmptyStateCard title="Unable to load study assistant" description={error} />
        <div className="tm-actions"><SecondaryButton type="button" onClick={loadData}>Try Again</SecondaryButton></div>
      </section>
    );
  }

  if (!data) return null;

  // ── Extract data ──
  const lectureItems = data.todaysLectures?.items || [];
  const dayLabel = data.todaysLectures?.dayOfWeek || "Today";
  const exams = data.examCountdown?.items || [];
  const modules = data.attendanceSummary?.modules || [];
  const overall = data.attendanceSummary?.overall || { percentage: 100 };
  const missed = data.missedLectures?.items || [];
  const pending = data.pendingMaterials?.pending || [];
  const pendingCount = data.pendingMaterials?.pendingCount || 0;
  const strategy = data.studyStrategy || {};
  const prioritized = strategy.prioritizedModules || [];
  const actions = strategy.actionItems || [];
  const healthScore = strategy.healthScore ?? 100;
  const nextExam = exams[0] || null;
  const notifications = data.notifications?.items || [];
  const unreadCount = data.notifications?.unreadCount || 0;

  return (
    <section className="study-assistant">
      {/* ── Header ── */}
      <GlassCard className="section-entrance sa-header-card" style={{ animationDelay: "40ms" }}>
        <PageHeader
          eyebrow="Lecture & Study Assistant"
          title={`Good ${getGreeting()}, ${user?.name || "Student"}`}
          subtitle="Your personalized academic dashboard — track, plan, and stay ahead."
        />
      </GlassCard>

      {/* ── Summary Stat Cards ── */}
      <div className="sa-stats-row section-entrance" style={{ animationDelay: "80ms" }}>
        <button type="button" className="sa-stat-card" onClick={() => setActiveTab("strategy")}>
          <span className={`sa-stat-value is-${healthScore >= 70 ? "success" : healthScore >= 40 ? "warning" : "danger"}`}>
            {healthScore}
          </span>
          <span className="sa-stat-label">Health Score</span>
        </button>

        <button type="button" className="sa-stat-card" onClick={() => setActiveTab("attendance")}>
          <span className={`sa-stat-value is-${getAttendanceBadge(overall.percentage)}`}>
            {overall.percentage}%
          </span>
          <span className="sa-stat-label">Attendance</span>
        </button>

        <button type="button" className="sa-stat-card" onClick={() => setActiveTab("exams")}>
          <span className={`sa-stat-value ${nextExam ? `is-${getCountdownBadge(nextExam.daysRemaining)}` : "is-success"}`}>
            {nextExam ? nextExam.daysRemaining : "--"}
          </span>
          <span className="sa-stat-label">{nextExam ? "Days to Exam" : "No Exams"}</span>
        </button>

        <button type="button" className="sa-stat-card" onClick={() => setActiveTab("materials")}>
          <span className={`sa-stat-value is-${pendingCount > 5 ? "danger" : pendingCount > 0 ? "warning" : "success"}`}>
            {pendingCount}
          </span>
          <span className="sa-stat-label">Pending Materials</span>
        </button>

        <button type="button" className="sa-stat-card" onClick={() => setActiveTab("notifications")}>
          <span className={`sa-stat-value is-${unreadCount > 3 ? "danger" : unreadCount > 0 ? "warning" : "success"}`}>
            {unreadCount}
          </span>
          <span className="sa-stat-label">Alerts</span>
        </button>
      </div>

      {/* ── Tab Navigation ── */}
      <nav className="sa-tabs section-entrance" style={{ animationDelay: "120ms" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`sa-tab ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === "missed" && missed.length > 0 && <span className="sa-tab-badge">{missed.length}</span>}
            {tab.key === "materials" && pendingCount > 0 && <span className="sa-tab-badge">{pendingCount}</span>}
            {tab.key === "lectures" && <span className="sa-tab-badge">{lectureItems.length}</span>}
            {tab.key === "exams" && exams.length > 0 && <span className="sa-tab-badge">{exams.length}</span>}
            {tab.key === "notifications" && unreadCount > 0 && <span className="sa-tab-badge sa-tab-badge-alert">{unreadCount}</span>}
          </button>
        ))}
      </nav>

      {/* ── Tab Content ── */}
      <div className="sa-tab-content section-entrance" style={{ animationDelay: "160ms" }}>

        {/* Study Strategy */}
        {activeTab === "strategy" && (
          <GlassCard as="section" className="ui-section sa-strategy-card">
            <SectionTitle
              eyebrow="AI Study Strategy"
              rightContent={
                <StatusBadge
                  level={healthScore >= 70 ? "success" : healthScore >= 40 ? "warning" : "danger"}
                  label={`Health: ${healthScore}/100`}
                />
              }
            />
            {prioritized.length > 0 ? (
              <>
                <div className="sa-priority-grid">
                  {prioritized.map((mod, idx) => (
                    <article key={mod.moduleCode} className={`sa-priority-card ${idx === 0 ? "is-top" : ""}`}>
                      <div className="sa-priority-rank">#{idx + 1}</div>
                      <div className="sa-priority-info">
                        <h4>{mod.moduleName} <span className="sa-priority-code">{mod.moduleCode}</span></h4>
                        <div className="sa-priority-tags">
                          {mod.attendance !== null && <span className={`sa-tag is-${getAttendanceBadge(mod.attendance)}`}>{mod.attendance}% att.</span>}
                          {mod.upcomingExams > 0 && <span className="sa-tag is-danger">{mod.upcomingExams} exam</span>}
                          {mod.pendingMaterials > 0 && <span className="sa-tag is-warning">{mod.pendingMaterials} unread</span>}
                          {mod.missedLectures > 0 && <span className="sa-tag is-danger">{mod.missedLectures} missed</span>}
                        </div>
                      </div>
                      <div className="sa-priority-score">
                        <span className="sa-score-number">{mod.score}</span>
                        <span className="sa-score-label">priority</span>
                      </div>
                    </article>
                  ))}
                </div>
                {actions.length > 0 && (
                  <div className="sa-actions-section">
                    <h3 className="sa-actions-title">Action Items</h3>
                    <div className="sa-actions-list">
                      {actions.map((item, i) => (
                        <div key={i} className="sa-action-item">
                          <StatusBadge level={getPriorityBadge(item.priority)} label={item.priority} />
                          <span className="sa-action-module">{item.moduleName}</span>
                          <span className="sa-action-text">{item.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="sa-empty"><h3>No strategy data available</h3><p>Add attendance records and materials to generate recommendations.</p></div>
            )}
          </GlassCard>
        )}

        {/* Today's Lectures */}
        {activeTab === "lectures" && (
          <GlassCard as="section" className="ui-section sa-lectures-card">
            <SectionTitle
              eyebrow={`${dayLabel}'s Lectures`}
              rightContent={<StatusBadge level="low" label={`${lectureItems.length} Session${lectureItems.length !== 1 ? "s" : ""}`} />}
            />
            {lectureItems.length > 0 ? (
              <div className="sa-lecture-list">
                {lectureItems.map((entry) => (
                  <article key={entry._id} className="sa-lecture-item">
                    <div className="sa-lecture-time">
                      <span className="sa-time-start">{entry.startTime}</span>
                      <span className="sa-time-sep">-</span>
                      <span className="sa-time-end">{entry.endTime}</span>
                    </div>
                    <div className="sa-lecture-info">
                      <h4 className="sa-lecture-module">{entry.moduleName || entry.moduleCode}</h4>
                      <p className="sa-lecture-meta">{entry.activityType} &middot; {entry.venue}</p>
                      {entry.lecturerNames?.length > 0 && <p className="sa-lecture-lecturer">{entry.lecturerNames.join(", ")}</p>}
                    </div>
                    <div className="sa-attendance-actions">
                      {entry.attendanceStatus ? (
                        <StatusBadge
                          level={entry.attendanceStatus === "Present" ? "success" : entry.attendanceStatus === "Late" ? "warning" : "danger"}
                          label={entry.attendanceStatus}
                        />
                      ) : (
                        <>
                          <button type="button" className="sa-mark-btn is-present" disabled={markingId === entry._id} onClick={() => handleMarkAttendance(entry._id, "Present")}>
                            {markingId === entry._id ? "..." : "Present"}
                          </button>
                          <button type="button" className="sa-mark-btn is-absent" disabled={markingId === entry._id} onClick={() => handleMarkAttendance(entry._id, "Absent")}>
                            Absent
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="sa-empty"><div className="sa-empty-icon" aria-hidden="true"><span className="sa-empty-circle" /></div><h3>No lectures scheduled</h3><p>You have no sessions on {dayLabel}. Use this time to review materials.</p></div>
            )}
          </GlassCard>
        )}

        {/* Exam Countdown */}
        {activeTab === "exams" && (
          <GlassCard as="section" className="ui-section sa-exams-card">
            <SectionTitle eyebrow="Exam Countdown" rightContent={<StatusBadge level={exams.length > 0 ? "warning" : "success"} label={`${exams.length} Upcoming`} />} />
            {exams.length > 0 ? (
              <div className="sa-exam-grid">
                {exams.map((exam) => (
                  <article key={exam._id} className="sa-exam-card">
                    <div className="sa-exam-countdown">
                      <span className={`sa-countdown-number is-${getCountdownBadge(exam.daysRemaining)}`}>{exam.daysRemaining}</span>
                      <span className="sa-countdown-label">day{exam.daysRemaining !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="sa-exam-info">
                      <h4 className="sa-exam-title">{exam.title}</h4>
                      <p className="sa-exam-module">{exam.moduleName || exam.moduleCode}</p>
                      <p className="sa-exam-date">{formatDate(exam.eventDate)}</p>
                      {exam.venue && <p className="sa-exam-venue">{exam.venue}</p>}
                    </div>
                    <StatusBadge level={getCountdownBadge(exam.daysRemaining)} label={exam.daysRemaining <= 3 ? "Urgent" : exam.daysRemaining <= 7 ? "Soon" : "Upcoming"} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="sa-empty"><div className="sa-empty-icon" aria-hidden="true"><span className="sa-empty-circle" /></div><h3>No upcoming exams</h3><p>No exams scheduled. Stay consistent with your studies.</p></div>
            )}
          </GlassCard>
        )}

        {/* Attendance */}
        {activeTab === "attendance" && (
          <GlassCard as="section" className="ui-section sa-attendance-card">
            <SectionTitle eyebrow="Attendance Overview" rightContent={<StatusBadge level={getAttendanceBadge(overall.percentage)} label={`Overall: ${overall.percentage}%`} />} />
            {modules.length > 0 ? (
              <div className="sa-attendance-list">
                {modules.map((mod) => (
                  <div key={mod.moduleCode} className="sa-attendance-row">
                    <div className="sa-attendance-module">
                      <span className="sa-attendance-code">{mod.moduleCode}</span>
                      <span className="sa-attendance-name">{mod.moduleName}</span>
                    </div>
                    <div className="sa-attendance-bar-wrap">
                      <div className="sa-attendance-bar">
                        <div className={`sa-attendance-fill is-${getAttendanceBadge(mod.percentage)}`} style={{ width: `${mod.percentage}%` }} />
                      </div>
                      <span className={`sa-attendance-pct is-${getAttendanceBadge(mod.percentage)}`}>{mod.percentage}%</span>
                    </div>
                    <div className="sa-attendance-stats">
                      <span className="sa-stat-present">{mod.present} present</span>
                      <span className="sa-stat-absent">{mod.absent} absent</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sa-empty"><div className="sa-empty-icon" aria-hidden="true"><span className="sa-empty-circle" /></div><h3>No attendance records</h3><p>Start marking attendance to see your overview.</p></div>
            )}
          </GlassCard>
        )}

        {/* Pending Materials */}
        {activeTab === "materials" && (
          <GlassCard as="section" className="ui-section sa-materials-card">
            <SectionTitle
              eyebrow="Pending Materials"
              rightContent={<StatusBadge level={pendingCount > 5 ? "danger" : pendingCount > 0 ? "warning" : "success"} label={`${pendingCount} Unread`} />}
            />
            {pending.length > 0 ? (
              <div className="sa-materials-list">
                {pending.map((mat) => (
                  <article key={mat._id} className="sa-material-item">
                    <div className="sa-material-type-badge">{mat.materialType}</div>
                    <div className="sa-material-info">
                      <h4>{mat.title}</h4>
                      <p>{mat.moduleName} ({mat.moduleCode}) &middot; {formatDate(mat.createdAt)}</p>
                      {mat.description && <p className="sa-material-desc">{mat.description}</p>}
                    </div>
                    <button
                      type="button"
                      className="sa-mark-btn is-present"
                      disabled={viewingId === mat._id}
                      onClick={() => handleMarkViewed(mat._id)}
                    >
                      {viewingId === mat._id ? "..." : "Mark Read"}
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="sa-empty"><div className="sa-empty-icon" aria-hidden="true"><span className="sa-empty-circle" /></div><h3>All caught up!</h3><p>You have reviewed all uploaded materials.</p></div>
            )}
          </GlassCard>
        )}

        {/* Missed Lectures */}
        {activeTab === "missed" && (
          <GlassCard as="section" className="ui-section sa-missed-card">
            <SectionTitle eyebrow="Missed Lectures" rightContent={<StatusBadge level={missed.length > 5 ? "danger" : missed.length > 0 ? "warning" : "success"} label={`${missed.length} Missed`} />} />
            {missed.length > 0 ? (
              <div className="sa-missed-list">
                {missed.map((item) => (
                  <article key={item._id} className="sa-missed-item">
                    <div className="sa-missed-date"><span>{formatDate(item.date)}</span></div>
                    <div className="sa-missed-info">
                      <h4>{item.moduleName} ({item.moduleCode})</h4>
                      <p>{item.activityType} &middot; {item.startTime} - {item.endTime} &middot; {item.venue}</p>
                      {item.lecturerNames?.length > 0 && <p className="sa-missed-lecturer">{item.lecturerNames.join(", ")}</p>}
                    </div>
                    {item.relatedMaterials?.length > 0 && (
                      <div className="sa-missed-materials">
                        {item.relatedMaterials.map((m) => <span key={m._id} className="sa-material-chip">{m.title}</span>)}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="sa-empty"><div className="sa-empty-icon" aria-hidden="true"><span className="sa-empty-circle" /></div><h3>No missed lectures</h3><p>Great job! You have not missed any lectures.</p></div>
            )}
          </GlassCard>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <GlassCard as="section" className="ui-section sa-notifications-card">
            <SectionTitle
              eyebrow="Notifications"
              rightContent={
                <div className="sa-notif-header-actions">
                  <StatusBadge level={unreadCount > 0 ? "warning" : "success"} label={`${unreadCount} Unread`} />
                  {unreadCount > 0 && (
                    <button type="button" className="sa-mark-btn is-present" disabled={markingRead} onClick={handleMarkAllRead}>
                      {markingRead ? "..." : "Mark All Read"}
                    </button>
                  )}
                </div>
              }
            />
            {notifications.length > 0 ? (
              <div className="sa-notif-list">
                {notifications.map((notif) => (
                  <article key={notif._id} className={`sa-notif-item ${notif.isRead ? "" : "is-unread"}`}>
                    <div className={`sa-notif-dot is-${notif.type === "deadline" ? "danger" : notif.type === "attendance" ? "warning" : "info"}`} />
                    <div className="sa-notif-content">
                      <p className="sa-notif-message">{notif.message}</p>
                      <span className="sa-notif-time">{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                    <StatusBadge
                      level={notif.type === "deadline" ? "danger" : notif.type === "attendance" ? "warning" : "low"}
                      label={notif.type}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <div className="sa-empty"><div className="sa-empty-icon" aria-hidden="true"><span className="sa-empty-circle" /></div><h3>No notifications</h3><p>You are all caught up. Notifications will appear here when there are updates.</p></div>
            )}
          </GlassCard>
        )}
      </div>
    </section>
  );
};

export default StudyAssistantPage;
