import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const LECTURER_MENU_ITEMS = [
  {
    label: "Dashboard",
    path: ROUTE_PATHS.lecturerDashboard,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h4v7H4v-7zm6 0h10v7H10v-7z" />
      </svg>
    ),
  },
  {
    label: "Timetable",
    path: ROUTE_PATHS.lecturerTimetable,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10z" />
      </svg>
    ),
  },
  {
    label: "Change Requests",
    path: ROUTE_PATHS.lecturerChangeRequests,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-4 4h6v2H8v-2zm0 4h6v2H8v-2z" />
      </svg>
    ),
  },
  {
    label: "Announcements",
    path: ROUTE_PATHS.lecturerAnnouncements,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9z" />
      </svg>
    ),
  },
  {
    label: "Student Messages",
    path: ROUTE_PATHS.lecturerMessages,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    label: "Contact Admin",
    path: ROUTE_PATHS.lecturerContactAdmin,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
      </svg>
    ),
  },
  {
    label: "Notices",
    path: ROUTE_PATHS.lecturerNotices,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
  },
  {
    label: "Student Feedback",
    path: ROUTE_PATHS.lecturerFeedback,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
  {
    label: "Performance Insights",
    path: ROUTE_PATHS.lecturerPerformance,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 13h2v8H3v-8zm4-5h2v13H7V8zm4-4h2v17h-2V4zm4 7h2v10h-2V11zm4-4h2v14h-2V7z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.lecturerDashboard]: "Lecturer Dashboard",
  [ROUTE_PATHS.lecturerTimetable]: "Timetable",
  [ROUTE_PATHS.lecturerChangeRequests]: "Change Requests",
  [ROUTE_PATHS.lecturerAnnouncements]: "Announcements",
  [ROUTE_PATHS.lecturerMessages]: "Student Messages",
  [ROUTE_PATHS.lecturerContactAdmin]: "Contact Admin",
  [ROUTE_PATHS.lecturerNotices]: "Notices",
  [ROUTE_PATHS.lecturerFeedback]: "Student Feedback",
  [ROUTE_PATHS.lecturerPerformance]: "Performance Insights",
};

const LecturerLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Lecturer Panel", [pathname]);

  const displayName = useMemo(() => {
    const rawName = (user?.name || "Lecturer").trim();
    if (!rawName) {
      return "Lecturer";
    }

    return `${rawName.charAt(0).toUpperCase()}${rawName.slice(1)}`;
  }, [user?.name]);

  const avatarInitials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean).slice(0, 2);
    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials || "LE";
  }, [displayName]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-shell app-grid main-layout main-layout-premium">
      <aside
        className={`sidebar main-sidebar ${isMobileMenuOpen ? "is-open" : ""}`}
      >
        <div className="sidebar-head">
          <NavLink
            to={ROUTE_PATHS.lecturerDashboard}
            className="icon-btn sidebar-home-link"
            onClick={closeMobileMenu}
            aria-label="Go to lecturer dashboard"
            title="Dashboard"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 18v-4h4v4m-9 2h14a1 1 0 0 0 1-1v-8.7a1 1 0 0 0-.32-.73l-7-6.4a1 1 0 0 0-1.36 0l-7 6.4a1 1 0 0 0-.32.73V19a1 1 0 0 0 1 1z" />
            </svg>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {LECTURER_MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `nav-link nav-pill nav-item ${isActive ? "active-menu" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="ghost-btn sidebar-logout" onClick={logout}>
          <span>Logout</span>
          <span className="sidebar-logout-icon" aria-hidden="true">&rarr;</span>
        </button>
      </aside>

      <div className="layout-content-wrap">
        <header className="topbar main-header">
          <div className="title-area">
            <button
              type="button"
              className="icon-btn mobile-nav-trigger"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Open navigation"
            >
              ≡
            </button>
            <div>
              <h2 className="page-title">{pageTitle}</h2>
            </div>
          </div>
          <div className="dashboard-head-meta">
            <section className="user-panel" aria-label="User information">
              <p className="user-name">
                <span className="user-avatar" aria-hidden="true">{avatarInitials}</span>
                <span className="user-chip-text">
                  <strong>{displayName}</strong>
                  <span className="user-chip-status">
                    <span className="user-status-dot" aria-hidden="true" />
                    <span className="user-status-label">Active</span>
                  </span>
                </span>
              </p>
            </section>
          </div>
        </header>

        <main className="main-content content-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
