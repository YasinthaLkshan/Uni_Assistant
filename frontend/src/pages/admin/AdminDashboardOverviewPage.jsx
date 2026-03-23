import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ROUTE_PATHS } from "../../routes/routePaths";

const SUMMARY_METRICS = [
  { label: "Total Students", value: "486", meta: "Across all active groups" },
  { label: "Total Groups", value: "18", meta: "Level 1 to Level 4" },
  { label: "Total Timetable Entries", value: "264", meta: "Weekly schedule records" },
  { label: "Upcoming Assignments", value: "23", meta: "Due within 7 days" },
  { label: "Upcoming Exams", value: "7", meta: "Scheduled this month" },
];

const RECENT_TIMETABLE_ENTRIES = [
  { group: "Group 2", day: "Monday", subject: "Database Systems", time: "09:00 - 11:00", venue: "Lab 03" },
  { group: "Group 5", day: "Tuesday", subject: "Software Engineering", time: "13:00 - 15:00", venue: "Hall B" },
  { group: "Group 1", day: "Wednesday", subject: "Computer Networks", time: "10:00 - 12:00", venue: "Room 201" },
  { group: "Group 7", day: "Thursday", subject: "AI Fundamentals", time: "08:30 - 10:30", venue: "Lab 01" },
];

const AdminDashboardOverviewPage = () => {
  const { user } = useAuth();

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-overview-intro admin-welcome-card">
        <p className="eyebrow">Admin Dashboard Home</p>
        <h2>Welcome, {user?.name || user?.username || "Admin"}</h2>
        <p>
          Manage student groups, timetable schedules, and assessment timelines from this
          premium Uni Assistant admin workspace.
        </p>

        <div className="admin-quick-actions">
          <Link to={ROUTE_PATHS.adminStudentProfiles} className="primary-btn">
            Manage Student Profiles
          </Link>
          <Link to={ROUTE_PATHS.adminModules} className="ghost-btn">
            Manage Modules
          </Link>
          <Link to={ROUTE_PATHS.adminAcademicEvents} className="ghost-btn">
            Manage Events
          </Link>
        </div>
      </article>

      <div className="admin-summary-grid">
        {SUMMARY_METRICS.map((metric) => (
          <article key={metric.label} className="admin-glass-card admin-summary-card">
            <p className="admin-metric-label">{metric.label}</p>
            <h3>{metric.value}</h3>
            <p className="admin-metric-trend">{metric.meta}</p>
          </article>
        ))}
      </div>

      <div className="admin-overview-panels">
        <article className="admin-glass-card admin-recent-table-card">
          <p className="eyebrow">Recent Timetable Entries</p>
          <div className="admin-recent-table">
            {RECENT_TIMETABLE_ENTRIES.map((entry) => (
              <article key={`${entry.group}-${entry.day}-${entry.subject}`} className="admin-table-row">
                <div>
                  <h4>{entry.subject}</h4>
                  <p>{entry.group} • {entry.day}</p>
                </div>
                <div className="admin-table-meta">
                  <span>{entry.time}</span>
                  <span>{entry.venue}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="admin-glass-card">
          <p className="eyebrow">Operational Focus</p>
          <ul className="admin-list">
            <li>Approve pending timetable edits before end of day</li>
            <li>Confirm exam halls for upcoming assessment window</li>
            <li>Verify assignment publish dates for all groups</li>
            <li>Coordinate viva and lab test panels with module leads</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default AdminDashboardOverviewPage;
