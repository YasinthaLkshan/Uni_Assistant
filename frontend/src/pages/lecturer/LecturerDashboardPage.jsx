import { useEffect, useState } from "react";

import { getLecturerDashboard } from "../../services/lecturerService";
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

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer Overview</p>
        <h2>Dashboard</h2>
        <p>Your academic overview at a glance.</p>

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
    </section>
  );
};

export default LecturerDashboardPage;
