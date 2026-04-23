import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";
import { ROUTE_PATHS } from "../../routes/routePaths";
import { extractApiErrorMessage } from "../../utils/error";

const LecturerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/lecturer/dashboard");
        setStats(data.data);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <section className="admin-page-grid section-entrance">
        <p>Loading dashboard...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-page-grid section-entrance">
        <p className="form-error">{error}</p>
      </section>
    );
  }

  const todaySchedule = stats?.todaySchedule || [];

  return (
    <section className="admin-page-grid section-entrance">
      {/* Stats Overview */}
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Overview</p>
        <h2>Welcome Back</h2>

        <div className="admin-filter-row" style={{ gap: "1.5rem", marginTop: "1.5rem" }}>
          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{stats?.modules ?? 0}</h3>
            <p>Assigned Modules</p>
          </article>

          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#fbbf24" }}>
              {stats?.pendingChangeRequests ?? 0}
            </h3>
            <p>Pending Requests</p>
          </article>

          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#3b82f6" }}>
              {stats?.unreadMessages ?? 0}
            </h3>
            <p>Unread Messages</p>
          </article>
        </div>

        {stats?.unreadMessages > 0 ? (
          <Link
            to={ROUTE_PATHS.lecturerMessages}
            className="admin-glass-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              textDecoration: "none",
              color: "inherit",
              borderLeft: "3px solid #3b82f6",
              marginTop: "1rem",
            }}
          >
            <div>
              <strong>{stats.unreadMessages} unread message(s) from students</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                Click to view and reply
              </p>
            </div>
            <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>View &rarr;</span>
          </Link>
        ) : null}

        {stats?.pendingChangeRequests > 0 ? (
          <Link
            to={ROUTE_PATHS.lecturerChangeRequests}
            className="admin-glass-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.8rem 1rem",
              textDecoration: "none",
              color: "inherit",
              borderLeft: "3px solid #fbbf24",
              marginTop: "1rem",
            }}
          >
            <div>
              <strong>{stats.pendingChangeRequests} change request(s) pending</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                Awaiting admin review
              </p>
            </div>
            <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>View &rarr;</span>
          </Link>
        ) : null}
      </article>

      {/* Today's Schedule */}
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Today</p>
        <h2>Today's Schedule</h2>

        {todaySchedule.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No classes scheduled for today.</p>
        ) : (
          <div className="admin-data-table-wrap" style={{ marginTop: "1rem" }}>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Module</th>
                  <th>Activity</th>
                  <th>Venue</th>
                  <th>Group</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedule.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.startTime} - {entry.endTime}</td>
                    <td>
                      <strong>{entry.moduleCode}</strong>
                      <p className="admin-inline-note">{entry.moduleName || "-"}</p>
                    </td>
                    <td>{entry.activityType || "-"}</td>
                    <td>{entry.venue || "-"}</td>
                    <td>G{entry.groupNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <Link to={ROUTE_PATHS.lecturerTimetable} className="primary-btn" style={{ textDecoration: "none" }}>
            View Full Timetable
          </Link>
        </div>
      </article>
    </section>
  );
};

export default LecturerDashboardPage;
