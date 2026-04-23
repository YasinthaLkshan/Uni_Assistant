import { useEffect, useMemo, useState } from "react";

import { EmptyStateCard, GlassCard, SectionTitle, StatusBadge } from "../components";
import { getMyTimetable } from "../services/studentAcademicService";
import { extractApiErrorMessage } from "../utils/error";
import { exportTimetablePdf } from "../utils/timetablePdf";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toMinutes = (value) => {
  if (!value || typeof value !== "string" || !value.includes(":")) {
    return 0;
  }

  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return (hours * 60) + minutes;
};

const normalizeActivity = (value = "") => value.toLowerCase().trim();

const getActivityToneClass = (activityType = "") => {
  const normalized = normalizeActivity(activityType);

  if (normalized.includes("lecture")) {
    return "is-lecture";
  }

  if (normalized.includes("tutorial")) {
    return "is-tutorial";
  }

  if (normalized.includes("practical")) {
    return "is-practical";
  }

  if (normalized.includes("lab")) {
    return "is-lab";
  }

  return "is-generic";
};

const MyTimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [scope, setScope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayDayName = useMemo(() => dayNames[new Date().getDay()], []);
  const dayOrder = useMemo(
    () => dayNames.reduce((record, day, index) => ({ ...record, [day]: index }), {}),
    []
  );

  const sortedEntries = useMemo(
    () => [...entries].sort((first, second) => {
      const dayDifference = (dayOrder[first.dayOfWeek] ?? 99) - (dayOrder[second.dayOfWeek] ?? 99);
      if (dayDifference !== 0) {
        return dayDifference;
      }

      return toMinutes(first.startTime) - toMinutes(second.startTime);
    }),
    [dayOrder, entries]
  );

  const todayEntries = useMemo(
    () => sortedEntries.filter((entry) => entry.dayOfWeek === todayDayName),
    [sortedEntries, todayDayName]
  );

  const weeklyHours = useMemo(
    () => (sortedEntries.reduce((sum, entry) => {
      const duration = Math.max(0, toMinutes(entry.endTime) - toMinutes(entry.startTime));
      return sum + duration;
    }, 0) / 60).toFixed(1),
    [sortedEntries]
  );

  const todayHours = useMemo(
    () => (todayEntries.reduce((sum, entry) => {
      const duration = Math.max(0, toMinutes(entry.endTime) - toMinutes(entry.startTime));
      return sum + duration;
    }, 0) / 60).toFixed(1),
    [todayEntries]
  );

  const nextClass = useMemo(() => {
    const now = new Date();
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    return todayEntries.find((entry) => toMinutes(entry.endTime) >= nowMinutes) || null;
  }, [todayEntries]);

  const handleDownloadPdf = () => {
    if (!sortedEntries.length) {
      return;
    }

    exportTimetablePdf({
      entries: sortedEntries,
      scope,
      todayDayName,
    });
  };

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyTimetable();
        setEntries(response?.data?.timetable || []);
        setScope(response?.data?.scope || null);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, []);

  return (
    <section className="dashboard student-academic-page student-timetable-clean">
      <GlassCard className="section-entrance timetable-hero-card">
        <div className="timetable-hero-head">
          <div className="timetable-hero-copy">
            <p className="eyebrow">Academic</p>
            <h1 className="dashboard-title">My Timetable</h1>
            <p>Your weekly timetable with a simple daily study plan.</p>
          </div>

          <div className="timetable-hero-actions">
            <button
              type="button"
              className="timetable-download-btn"
              onClick={handleDownloadPdf}
              disabled={!sortedEntries.length || loading}
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="timetable-hero-chips">
          <span className="timetable-hero-chip">{sortedEntries.length} weekly session(s)</span>
          <span className="timetable-hero-chip">{todayEntries.length} class(es) today</span>
          <span className="timetable-hero-chip">Today: {todayDayName}</span>
        </div>
      </GlassCard>

      {scope ? (
        <GlassCard className="ui-section section-entrance timetable-scope-card" style={{ animationDelay: "60ms" }}>
          <SectionTitle
            eyebrow="Your Scope"
            rightContent={<StatusBadge level="low" label={`Semester ${scope.semester} • Group ${scope.groupNumber}`} />}
          />

          <div className="timetable-scope-grid">
            <article className="timetable-scope-item">
              <p className="timetable-scope-label">Semester</p>
              <h4 className="timetable-scope-value">{scope.semester}</h4>
              <p className="timetable-scope-note">Current academic term</p>
            </article>

            <article className="timetable-scope-item">
              <p className="timetable-scope-label">Group</p>
              <h4 className="timetable-scope-value">{scope.groupNumber}</h4>
              <p className="timetable-scope-note">Your assigned batch</p>
            </article>

            <article className="timetable-scope-item">
              <p className="timetable-scope-label">Weekly Classes</p>
              <h4 className="timetable-scope-value">{sortedEntries.length}</h4>
              <p className="timetable-scope-note">Total scheduled sessions</p>
            </article>
          </div>
        </GlassCard>
      ) : null}

      {error ? <p className="form-error section-entrance">{error}</p> : null}

      <GlassCard className="ui-section section-entrance timetable-plan-section" style={{ animationDelay: "100ms" }}>
        <SectionTitle
          eyebrow="Today's Plan"
          rightContent={
            <StatusBadge
              level={todayEntries.length ? "success" : "low"}
              label={todayEntries.length ? `${todayEntries.length} class(es) today` : "No classes today"}
            />
          }
        />

        <div className="timetable-plan-grid">
          <article className="timetable-plan-card">
            <p className="timetable-plan-label">Next Class</p>
            <h3 className="timetable-plan-value">{nextClass ? `${nextClass.startTime} - ${nextClass.endTime}` : "No more classes"}</h3>
            <p className="timetable-plan-note">{nextClass ? `${nextClass.moduleCode} ${nextClass.activityType}` : "You are free for the rest of today."}</p>
          </article>

          <article className="timetable-plan-card">
            <p className="timetable-plan-label">Today's Load</p>
            <h3 className="timetable-plan-value">{todayEntries.length} class(es)</h3>
            <p className="timetable-plan-note">About {todayHours} hour(s) of scheduled learning.</p>
          </article>

          <article className="timetable-plan-card">
            <p className="timetable-plan-label">Weekly Load</p>
            <h3 className="timetable-plan-value">{sortedEntries.length} session(s)</h3>
            <p className="timetable-plan-note">Total week plan: {weeklyHours} hour(s).</p>
          </article>
        </div>

        <div className="timetable-today-list">
          {todayEntries.length ? (
            todayEntries.map((entry) => (
              <article key={`today-${entry._id}`} className="timetable-today-item">
                <p className="timetable-today-time">{entry.startTime} - {entry.endTime}</p>
                <div>
                  <h4>
                    {entry.moduleCode}
                    <span className={`timetable-activity-pill ${getActivityToneClass(entry.activityType)}`}>
                      {entry.activityType}
                    </span>
                  </h4>
                  <p>{entry.moduleName} · {entry.venue || "Venue TBA"}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="timetable-empty-note">No classes scheduled for today. Use this time for revision or pending tasks.</p>
          )}
        </div>
      </GlassCard>

      <GlassCard className="ui-section section-entrance timetable-weekly-section" style={{ animationDelay: "140ms" }}>
        <SectionTitle
          eyebrow="Weekly Schedule"
          rightContent={<StatusBadge level="success" label={`Today: ${todayDayName}`} />}
        />

        {loading ? <p>Loading timetable...</p> : null}

        {!loading && !entries.length ? (
          <EmptyStateCard
            title="No timetable entries"
            description="Your timetable will appear here once admin publishes entries for your group."
          />
        ) : null}

        {!loading && sortedEntries.length ? (
          <div className="student-table-wrap">
            <table className="student-data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Module</th>
                  <th>Activity</th>
                  <th>Lecturers</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => {
                  const isToday = entry.dayOfWeek === todayDayName;

                  return (
                    <tr key={entry._id} className={isToday ? "is-today-row" : ""}>
                      <td>
                        {entry.dayOfWeek}
                        {isToday ? <span className="student-pill">Today</span> : null}
                      </td>
                      <td>{entry.startTime} - {entry.endTime}</td>
                      <td>
                        <strong>{entry.moduleCode}</strong>
                        <p className="student-cell-subtext">{entry.moduleName}</p>
                      </td>
                      <td>
                        <span className={`timetable-activity-pill ${getActivityToneClass(entry.activityType)}`}>
                          {entry.activityType}
                        </span>
                      </td>
                      <td>{Array.isArray(entry.lecturerNames) && entry.lecturerNames.length ? entry.lecturerNames.join(", ") : "-"}</td>
                      <td>{entry.venue || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </GlassCard>
    </section>
  );
};

export default MyTimetablePage;
