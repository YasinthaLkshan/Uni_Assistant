import { useEffect, useMemo, useState } from "react";

import { EmptyStateCard, GlassCard, SectionTitle, StatusBadge } from "../components";
import { getMyTimetable } from "../services/studentAcademicService";
import { extractApiErrorMessage } from "../utils/error";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MyTimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [scope, setScope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayDayName = useMemo(() => dayNames[new Date().getDay()], []);

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
    <section className="dashboard student-academic-page">
      <GlassCard className="section-entrance">
        <p className="eyebrow">Academic</p>
        <h1 className="dashboard-title">My Timetable</h1>
        <p>Your weekly timetable for the current semester and group.</p>
      </GlassCard>

      {scope ? (
        <GlassCard className="ui-section section-entrance" style={{ animationDelay: "60ms" }}>
          <SectionTitle
            eyebrow="Your Scope"
            rightContent={<StatusBadge level="low" label={`Semester ${scope.semester} • Group ${scope.groupNumber}`} />}
          />
        </GlassCard>
      ) : null}

      {error ? <p className="form-error section-entrance">{error}</p> : null}

      <GlassCard className="ui-section section-entrance" style={{ animationDelay: "120ms" }}>
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

        {!loading && entries.length ? (
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
                {entries.map((entry) => {
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
                      <td>{entry.activityType}</td>
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
