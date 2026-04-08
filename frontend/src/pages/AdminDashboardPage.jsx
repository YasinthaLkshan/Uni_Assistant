import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.username || "Admin";

  return (
    <section className="admin-dash-shell page-fade-in">
      {/* Hero Welcome Card */}
      <article className="admin-dash-card admin-dash-hero">
        <p className="eyebrow">Welcome to admin workspace</p>
        <h1>Welcome, {displayName}</h1>
        <p className="admin-dash-copy">
          Keep academic operations organized from one clear panel. Manage students, modules, timetables, and events.
        </p>

        <div className="admin-dash-actions">
          <Link to={ROUTE_PATHS.adminModules} className="primary-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 3h16v4H4V3zm0 7h16v11H4V10zm3 2v2h4v-2H7zm0 4v2h7v-2H7z" />
            </svg>
            Manage Modules
          </Link>
          <Link to={ROUTE_PATHS.adminTimetable} className="ghost-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2z" />
            </svg>
            View Timetable
          </Link>
        </div>
      </article>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <article className="admin-dash-card admin-stat-card">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Registered Students</p>
            <p className="admin-stat-number">24</p>
          </div>
        </article>

        <article className="admin-dash-card admin-stat-card">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Groups</p>
            <p className="admin-stat-number">6</p>
          </div>
        </article>

        <article className="admin-dash-card admin-stat-card">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Active Modules</p>
            <p className="admin-stat-number">12</p>
          </div>
        </article>
      </div>

      {/* Two Column Content */}
      <div className="admin-content-grid">
        {/* Left: Recent Timetable Updates */}
        <article className="admin-dash-card admin-table-section">
          <div className="admin-section-header">
            <p className="eyebrow">schedule overview</p>
            <h3>Recent Timetable Updates</h3>
          </div>

          <div className="admin-table-list">
            <div className="admin-table-row">
              <div className="admin-table-col-main">
                <h4>Network Design & Management</h4>
                <p>NDM • L2:T2 Lab 2</p>
              </div>
              <div className="admin-table-col-meta">
                <span>12:30 - 14:00</span>
                <span>Room 2</span>
              </div>
            </div>

            <div className="admin-table-row">
              <div className="admin-table-col-main">
                <h4>Database Systems</h4>
                <p>DS • L2:T2 Lab 2</p>
              </div>
              <div className="admin-table-col-meta">
                <span>14:30 - 16:00</span>
                <span>Room 3</span>
              </div>
            </div>

            <div className="admin-table-row">
              <div className="admin-table-col-main">
                <h4>IT Project Management</h4>
                <p>ITPM • L2:T2 Lab 2</p>
              </div>
              <div className="admin-table-col-meta">
                <span>16:00 - 17:30</span>
                <span>Room 1</span>
              </div>
            </div>
          </div>
        </article>

        {/* Right: Today Focus */}
        <article className="admin-dash-card admin-focus-section">
          <div className="admin-section-header">
            <p className="eyebrow">focus areas</p>
            <h3>Today Focus</h3>
          </div>

          <ul className="admin-focus-list">
            <li>Programming Applications & Frameworks</li>
            <li>Complete student profile verification</li>
            <li>Review academic event schedules</li>
            <li>Approve pending timetable changes</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
