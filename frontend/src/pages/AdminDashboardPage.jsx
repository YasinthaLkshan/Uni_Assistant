import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.username || "Admin";

  return (
    <section className="admin-dash-shell page-fade-in">
      <article className="admin-dash-card admin-dash-hero">
        <p className="eyebrow">Admin Workspace</p>
        <h1>Welcome, {displayName}</h1>
        <p className="admin-dash-copy">
          Keep academic operations organized from one clear panel. Pick a section below to manage
          student records, modules, timetables, or academic events.
        </p>

        <div className="admin-dash-actions">
          <Link to={ROUTE_PATHS.adminStudentProfiles} className="primary-btn">
            Manage Student Profiles
          </Link>
          <Link to={ROUTE_PATHS.adminModules} className="ghost-btn">
            Manage Modules
          </Link>
          <button type="button" className="ui-btn admin-dash-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </article>

      <section className="admin-dash-grid" aria-label="Quick admin sections">
        <article className="admin-dash-card admin-dash-tile">
          <h3>Timetable Control</h3>
          <p>Update schedules by faculty, semester, and group in one place.</p>
          <Link to={ROUTE_PATHS.adminTimetable} className="ghost-btn">Open Timetable</Link>
        </article>

        <article className="admin-dash-card admin-dash-tile">
          <h3>Academic Events</h3>
          <p>Publish upcoming events and keep students informed on key dates.</p>
          <Link to={ROUTE_PATHS.adminAcademicEvents} className="ghost-btn">Open Events</Link>
        </article>

        <article className="admin-dash-card admin-dash-tile">
          <h3>Student View Check</h3>
          <p>Quickly switch to student-side pages to verify end-user experience.</p>
          <Link to={ROUTE_PATHS.dashboard} className="ghost-btn">Open Student Dashboard</Link>
        </article>
      </section>
    </section>
  );
};

export default AdminDashboardPage;
