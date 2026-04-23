import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getLecturerDashboard } from "../../services/lecturerService";
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
        const response = await getLecturerDashboard();
        setStats(response.data);
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

  const pending = stats?.pendingTasks || {};
  const hasPendingItems =
    pending.draftSessions > 0 ||
    pending.pendingChangeRequests > 0 ||
    pending.pendingVivas > 0 ||
    pending.pendingExamPapers > 0 ||
    pending.unscheduledModules > 0;

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer Overview</p>
        <h2>Dashboard</h2>
        <p>Your academic overview at a glance.</p>

        {/* Stats Cards */}
        <div className="admin-filter-row" style={{ gap: "1.5rem", marginTop: "1.5rem" }}>
          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{stats?.modules ?? 0}</h3>
            <p>Assigned Modules</p>
          </article>

          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{stats?.totalEvents ?? 0}</h3>
            <p>Total Events</p>
          </article>

          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{stats?.upcomingEvents ?? 0}</h3>
            <p>Upcoming Events</p>
          </article>

          <article className="admin-glass-card" style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{stats?.totalStudents ?? 0}</h3>
            <p>Total Students</p>
          </article>
        </div>
      </article>

      {/* Pending Tasks */}
      {hasPendingItems ? (
        <article className="admin-glass-card admin-module-card">
          <p className="eyebrow">Action Required</p>
          <h2>Pending Tasks</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
            {pending.unscheduledModules > 0 ? (
              <Link
                to={ROUTE_PATHS.lecturerSchedule}
                className="admin-glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.8rem 1rem",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "3px solid #ef4444",
                }}
              >
                <div>
                  <strong>{pending.unscheduledModules} module(s) need scheduling</strong>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                    {pending.unscheduledModuleList?.map((m) => m.moduleCode).join(", ")}
                  </p>
                </div>
                <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>Schedule &rarr;</span>
              </Link>
            ) : null}

            {pending.draftSessions > 0 ? (
              <Link
                to={ROUTE_PATHS.lecturerSchedule}
                className="admin-glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.8rem 1rem",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "3px solid #fbbf24",
                }}
              >
                <div>
                  <strong>{pending.draftSessions} draft session(s) not submitted</strong>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                    Complete scheduling and submit to finalize
                  </p>
                </div>
                <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>Review &rarr;</span>
              </Link>
            ) : null}

            {pending.pendingChangeRequests > 0 ? (
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
                  borderLeft: "3px solid #3b82f6",
                }}
              >
                <div>
                  <strong>{pending.pendingChangeRequests} change request(s) awaiting review</strong>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                    Admin has not yet responded to your schedule change requests
                  </p>
                </div>
                <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>View &rarr;</span>
              </Link>
            ) : null}

            {pending.pendingVivas > 0 ? (
              <Link
                to={ROUTE_PATHS.lecturerVivas}
                className="admin-glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.8rem 1rem",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "3px solid #a855f7",
                }}
              >
                <div>
                  <strong>{pending.pendingVivas} viva(s) awaiting approval</strong>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                    Proposed viva dates pending admin approval
                  </p>
                </div>
                <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>View &rarr;</span>
              </Link>
            ) : null}

            {pending.pendingExamPapers > 0 ? (
              <Link
                to={ROUTE_PATHS.lecturerExamSubmission}
                className="admin-glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.8rem 1rem",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "3px solid #10b981",
                }}
              >
                <div>
                  <strong>{pending.pendingExamPapers} exam paper(s) pending approval</strong>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>
                    Submitted exam papers awaiting admin review
                  </p>
                </div>
                <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>View &rarr;</span>
              </Link>
            ) : null}
          </div>
        </article>
      ) : (
        <article className="admin-glass-card admin-module-card">
          <p className="eyebrow">Status</p>
          <h2>All Clear</h2>
          <p style={{ opacity: 0.7 }}>No pending tasks at the moment.</p>
        </article>
      )}
    </section>
  );
};

export default LecturerDashboardPage;
