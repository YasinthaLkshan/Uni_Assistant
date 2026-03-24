import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ROUTE_PATHS } from "../../routes/routePaths";
import { listStudentProfiles } from "../../services/studentProfileService";
import { listTimetableEntries } from "../../services/timetableManagementService";

const formatUpdatedDate = (value) => {
  if (!value) return "Recently updated";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently updated";

  return parsed.toLocaleString();
};

const AdminDashboardOverviewPage = () => {
  const { user } = useAuth();
  const displayName = user?.name || user?.username || "Admin";

  const [studentProfiles, setStudentProfiles] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsResponse, timetableResponse] = await Promise.all([
          listStudentProfiles(),
          listTimetableEntries(),
        ]);

        setStudentProfiles(studentsResponse?.data || []);
        setTimetableEntries(timetableResponse?.data || []);
      } catch (_err) {
        setError("Unable to load latest dashboard metrics right now.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const registeredStudentsCount = useMemo(
    () => studentProfiles.filter((profile) => profile.registrationStatus === "registered").length,
    [studentProfiles]
  );

  const totalGroupsCount = useMemo(() => {
    const groupKeys = new Set();

    studentProfiles.forEach((profile) => {
      if (profile.semester && profile.groupNumber) {
        groupKeys.add(`${profile.semester}-${profile.groupNumber}`);
      }
    });

    timetableEntries.forEach((entry) => {
      if (entry.semester && entry.groupNumber) {
        groupKeys.add(`${entry.semester}-${entry.groupNumber}`);
      }
    });

    return groupKeys.size;
  }, [studentProfiles, timetableEntries]);

  const highlights = useMemo(
    () => [
      {
        label: "Registered Students",
        value: loading ? "..." : String(registeredStudentsCount),
        meta: "Students with confirmed registration",
        icon: "students",
      },
      {
        label: "Total Groups",
        value: loading ? "..." : String(totalGroupsCount),
        meta: "Active semester-group combinations",
        icon: "groups",
      },
    ],
    [loading, registeredStudentsCount, totalGroupsCount]
  );

  const recentUpdates = useMemo(() => {
    return [...timetableEntries]
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [timetableEntries]);

  return (
    <section className="admin-page-grid admin-home-simple section-entrance">
      <article className="admin-glass-card admin-simple-hero admin-home-hero-card">
        <div className="admin-home-hero-content">
          <p className="eyebrow">Admin Dashboard Home</p>
          <h2>Welcome, {displayName}</h2>
          <p className="admin-home-hero-copy">
            A simplified control center to manage modules, timetable, and academic events.
          </p>

          <div className="admin-simple-actions admin-home-btn-row">
            <Link to={ROUTE_PATHS.adminAcademicEvents} className="primary-btn admin-home-btn">Academic Events</Link>
            <Link to={ROUTE_PATHS.adminTimetable} className="ghost-btn admin-home-btn">Timetable</Link>
            <Link to={ROUTE_PATHS.adminStudentProfiles} className="ghost-btn admin-home-btn">Student Profiles</Link>
          </div>
        </div>
      </article>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-simple-metrics admin-home-summary-grid">
        {highlights.map((metric) => (
          <article key={metric.label} className="admin-glass-card admin-simple-metric-card admin-home-summary-card">
            <div className="admin-summary-head-row">
              <p className="admin-metric-label">{metric.label}</p>
              <span className={`admin-summary-glyph is-${metric.icon}`} aria-hidden="true" />
            </div>
            <h3>{metric.value}</h3>
            <p className="admin-metric-trend">{metric.meta}</p>
          </article>
        ))}
      </div>

      <div className="admin-simple-panels admin-home-panels">
        <article className="admin-glass-card admin-home-panel admin-home-recent-panel">
          <div className="admin-home-panel-head">
            <p className="eyebrow">Recent Timetable Updates</p>
          </div>

          {!loading && recentUpdates.length === 0 ? <p className="admin-metric-trend">No timetable updates found.</p> : null}

          <div className="admin-recent-table">
            {recentUpdates.map((entry) => (
              <article key={entry._id} className="admin-table-row admin-home-update-row">
                <div className="admin-home-update-main">
                  <span className="admin-update-dot" aria-hidden="true" />
                  <h4>{entry.moduleName || entry.moduleCode || "Timetable Entry"}</h4>
                  <p>
                    Semester {entry.semester} • Group {entry.groupNumber} • {entry.dayOfWeek}
                  </p>
                  <p className="admin-inline-note">Updated: {formatUpdatedDate(entry.updatedAt || entry.createdAt)}</p>
                </div>
                <div className="admin-table-meta admin-home-update-meta">
                  <span>{entry.startTime} - {entry.endTime}</span>
                  <span>{entry.venue || "TBA"}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="admin-glass-card admin-focus-panel admin-home-panel">
          <div className="admin-home-panel-head">
            <p className="eyebrow">Today Focus</p>
          </div>
          <ul className="admin-list admin-home-focus-list">
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
