import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const ADMIN_MENU_ITEMS = [
  {
    label: "Dashboard",
    path: ROUTE_PATHS.adminDashboard,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h4v7H4v-7zm6 0h10v7H10v-7z" />
      </svg>
    ),
  },
  {
    label: "Modules",
    path: ROUTE_PATHS.adminModules,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h16v4H4V3zm0 7h16v11H4V10zm3 2v2h4v-2H7zm0 4v2h7v-2H7z" />
      </svg>
    ),
  },
  {
    label: "Timetable",
    path: ROUTE_PATHS.adminTimetable,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10z" />
      </svg>
    ),
  },
  {
    label: "Academic Events",
    path: ROUTE_PATHS.adminAcademicEvents,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V9h14v10z" />
      </svg>
    ),
  },
  {
    label: "Viva Review",
    path: ROUTE_PATHS.adminVivaReview,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    label: "Change Requests",
    path: ROUTE_PATHS.adminChangeRequests,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm4 12H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z" />
      </svg>
    ),
  },
  {
    label: "Holidays",
    path: ROUTE_PATHS.adminHolidays,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1a2 2 0 0 0 2 2v1.93zm6.9-2.54A1.99 1.99 0 0 0 16 16h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.98 7.98 0 0 1 2.9 12.8z" />
      </svg>
    ),
  },
  {
    label: "FCSC Informs",
    path: ROUTE_PATHS.adminFcscInforms,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.adminDashboard]: "Admin Dashboard",
  [ROUTE_PATHS.adminStudentProfiles]: "Students",
  [ROUTE_PATHS.adminModules]: "Modules",
  [ROUTE_PATHS.adminTimetable]: "Timetable",
  [ROUTE_PATHS.adminAcademicEvents]: "Academic Events",
  [ROUTE_PATHS.adminFcscInforms]: "FCSC Informs",
  [ROUTE_PATHS.adminLecturers]: "Lecturers",
  [ROUTE_PATHS.adminHolidays]: "Holidays",
  [ROUTE_PATHS.adminChangeRequests]: "Change Requests",
  [ROUTE_PATHS.adminVivaReview]: "Viva Review",
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Admin Panel", [pathname]);
  const isDashboard = pathname === ROUTE_PATHS.adminDashboard;
  const profileName = user?.name || "Admin";
  const profileInitial = profileName.charAt(0).toUpperCase();

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
          <NavLink to={ROUTE_PATHS.adminDashboard} className="admin-brand" onClick={closeMobileMenu}>
            Uni Assistant Admin
          </NavLink>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_MENU_ITEMS.map((item) => (
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
        {isDashboard && (
          <header className="admin-header">
            <div className="title-area">
              <button
                type="button"
                className="icon-btn admin-mobile-trigger"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Open admin navigation"
              >
                ≡
              </button>
              <div>
                <p className="eyebrow">Administration Panel</p>
                <h2 className="page-title">{pageTitle}</h2>
              </div>
            </div>

            <section className="admin-profile-chip" aria-label="Admin profile">
              <span className="admin-chip-avatar" aria-hidden="true">{profileInitial}</span>
              <div className="admin-chip-body">
                <p className="admin-chip-name">{profileName}</p>
                <p className="admin-chip-meta">
                  <span className="admin-chip-status-dot" aria-hidden="true" />
                  Active
                </p>
              </div>
            </section>
          </header>
        )}

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
