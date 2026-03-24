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
  const displayName = user?.name || user?.username || "Admin";
  const highlights = SUMMARY_METRICS.slice(0, 3);
  const recentUpdates = RECENT_TIMETABLE_ENTRIES.slice(0, 3);

  return (
    <section className="admin-page-grid admin-home-simple section-entrance">
      <article className="admin-glass-card admin-simple-hero">
        <div>
          <p className="eyebrow">Admin Dashboard Home</p>
          <h2>Welcome, {displayName}</h2>
          <p>
            A simplified control center to manage modules, timetable, and academic events.
          </p>
          <Link to={ROUTE_PATHS.adminAcademicEvents} className="ghost-btn">Academic Events</Link>
        </div>
      </article>

      <div className="admin-simple-metrics">
        {highlights.map((metric) => (
          <article key={metric.label} className="admin-glass-card admin-simple-metric-card">
            <p className="admin-metric-label">{metric.label}</p>
            <h3>{metric.value}</h3>
            <p className="admin-metric-trend">{metric.meta}</p>
          </article>
        ))}
      </div>

      <div className="admin-simple-panels">
        <article className="admin-glass-card">
          <p className="eyebrow">Recent Timetable Updates</p>
          <div className="admin-recent-table">
            {recentUpdates.map((entry) => (
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

        <article className="admin-glass-card admin-focus-panel">
          <p className="eyebrow">Today Focus</p>
          <ul className="admin-list">
            <li>Review newly registered student timetable scope coverage</li>
            <li>Validate next week timetable publishing</li>
            <li>Finalize upcoming assessment event notices</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default AdminDashboardOverviewPage;
