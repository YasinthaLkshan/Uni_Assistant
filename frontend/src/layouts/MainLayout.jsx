import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    path: ROUTE_PATHS.dashboard,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h4v7H4v-7zm6 0h10v7H10v-7z" />
      </svg>
    ),
  },
  {
    label: "Study Assistant",
    path: ROUTE_PATHS.studyAssistant,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    path: ROUTE_PATHS.tasks,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4h11v2H9V4zM9 11h11v2H9v-2zM9 18h11v2H9v-2zM4.5 5.5l1.2-1.2 1.8 1.8-1.2 1.2-1.8-1.8zm0 7 1.2-1.2 1.8 1.8-1.2 1.2-1.8-1.8zm0 7 1.2-1.2 1.8 1.8-1.2 1.2-1.8-1.8z" />
      </svg>
    ),
  },
  {
    label: "My Modules",
    path: ROUTE_PATHS.myModules,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-8-3-8 3V5zm4 1v2h8V6H8zm0 4v2h8v-2H8z" />
      </svg>
    ),
  },
  {
    label: "My Timetable",
    path: ROUTE_PATHS.myTimetable,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10z" />
      </svg>
    ),
  },
  {
    label: "My Academic Events",
    path: ROUTE_PATHS.myEvents,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V9h14v10z" />
      </svg>
    ),
  },
  {
    label: "GPA Calculator",
    path: ROUTE_PATHS.gpaCalculator,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5h18v2H3V5zm0 6h10v2H3v-2zm0 6h6v2H3v-2zm14.59-5L21 14.41 19.59 15.83 17 13.24l-2.59 2.59L13 14.41 15.59 12 13 9.41 14.41 8 17 10.59 19.59 8 21 9.41 18.41 12z" />
      </svg>
    ),
  },
  {
    label: "Announcements",
    path: ROUTE_PATHS.studentAnnouncements,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9z" />
      </svg>
    ),
  },
  {
    label: "Messages",
    path: ROUTE_PATHS.studentMessages,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    label: "Feedback",
    path: ROUTE_PATHS.studentFeedback,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.dashboard]: "Dashboard Overview",
  [ROUTE_PATHS.studyAssistant]: "Lecture & Study Assistant",
  [ROUTE_PATHS.tasks]: "Task Management",
  [ROUTE_PATHS.myModules]: "My Modules",
  [ROUTE_PATHS.myTimetable]: "My Timetable",
  [ROUTE_PATHS.myEvents]: "My Academic Events",
  [ROUTE_PATHS.gpaCalculator]: "GPA Calculator",
  [ROUTE_PATHS.studentAnnouncements]: "Announcements",
  [ROUTE_PATHS.studentMessages]: "Messages",
  [ROUTE_PATHS.studentFeedback]: "Lecture Feedback",
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Uni Assistant", [pathname]);
  const displayName = useMemo(() => {
    const rawName = (user?.name || "Student").trim();
    if (!rawName) {
      return "Student";
    }

    return `${rawName.charAt(0).toUpperCase()}${rawName.slice(1)}`;
  }, [user?.name]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const avatarInitials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean).slice(0, 2);
    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials || "ST";
  }, [displayName]);

  return (
    <div className="app-shell app-grid page-fade-in main-layout main-layout-premium">
      <aside
        className={`sidebar main-sidebar ${isMobileMenuOpen ? "is-open" : ""}`}
      >
        <div className="sidebar-head">
          <NavLink
            to={ROUTE_PATHS.home}
            className="icon-btn sidebar-home-link home-button-fancy"
            onClick={closeMobileMenu}
            aria-label="Go to home page"
            title="Home"
          >
            <svg className="home-button-logo" viewBox="0 0 24 24" aria-hidden="true">
              <path
                className="home-button-roof"
                d="M3.8 10.5 12 3.7l8.2 6.8v8.2a1.3 1.3 0 0 1-1.3 1.3H5.1a1.3 1.3 0 0 1-1.3-1.3z"
              />
              <path
                className="home-button-door"
                d="M9.7 20v-4.6a1 1 0 0 1 1-1h2.6a1 1 0 0 1 1 1V20"
              />
              <circle className="home-button-spark" cx="18.1" cy="6.2" r="1.1" />
            </svg>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
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

export default MainLayout;
