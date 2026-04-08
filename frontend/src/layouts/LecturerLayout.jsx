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
    label: "Notices",
    path: ROUTE_PATHS.lecturerNotices,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.lecturerDashboard]: "Lecturer Dashboard",
  [ROUTE_PATHS.lecturerTimetable]: "Timetable",
  [ROUTE_PATHS.lecturerChangeRequests]: "Change Requests",
  [ROUTE_PATHS.lecturerNotices]: "Notices",
};

const LecturerLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Lecturer Panel", [pathname]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-shell admin-grid page-fade-in">
      <aside
        className={`admin-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""} ${
          isMobileMenuOpen ? "is-open" : ""
        }`}
      >
        <div className="admin-sidebar-head">
          <NavLink to={ROUTE_PATHS.lecturerDashboard} className="admin-brand" onClick={closeMobileMenu}>
            Uni Assistant
          </NavLink>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle lecturer sidebar"
          >
            {isSidebarCollapsed ? ">" : "<"}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {LECTURER_MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "is-active" : ""}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="admin-logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <div className="admin-content-wrap">
        <header className="admin-header">
          <div className="title-area">
            <button
              type="button"
              className="icon-btn admin-mobile-trigger"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Open lecturer navigation"
            >
              ≡
            </button>
            <div>
              <p className="eyebrow">Lecturer Panel</p>
              <h2 className="page-title">{pageTitle}</h2>
            </div>
          </div>

          <section className="admin-profile-chip" aria-label="Lecturer profile">
            <span className="admin-chip-avatar">
              {(user?.name || "L").charAt(0).toUpperCase()}
            </span>
            <div className="admin-chip-info">
              <p className="admin-chip-name">{user?.name || "Lecturer"}</p>
              <p className="admin-chip-meta">Lecturer</p>
            </div>
          </section>
        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
