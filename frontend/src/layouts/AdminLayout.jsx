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
    label: "Timetable Management",
    path: ROUTE_PATHS.adminTimetable,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10z" />
      </svg>
    ),
  },
  {
    label: "Student Groups",
    path: ROUTE_PATHS.adminStudentGroups,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11zM8 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM8 14c-.33 0-.69.02-1.08.06C4.43 14.35 0 15.53 0 18v2h6v-2c0-1.48.81-2.87 2.2-3.99A9.8 9.8 0 0 0 8 14z" />
      </svg>
    ),
  },
  {
    label: "Assignments",
    path: ROUTE_PATHS.adminAssignments,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z" />
      </svg>
    ),
  },
  {
    label: "Presentations",
    path: ROUTE_PATHS.adminPresentations,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 4h18v10H3V4zm8 12h2v2h3v2H8v-2h3v-2z" />
      </svg>
    ),
  },
  {
    label: "Viva",
    path: ROUTE_PATHS.adminViva,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a7 7 0 0 0-7 7v4a4 4 0 0 0 3 3.87V20h8v-2.13A4 4 0 0 0 19 14v-4a7 7 0 0 0-7-7z" />
      </svg>
    ),
  },
  {
    label: "Lab Tests",
    path: ROUTE_PATHS.adminLabTests,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 2h6v2h-1v5.59l4.7 8.14A3 3 0 0 1 16.1 22H7.9a3 3 0 0 1-2.6-4.27L10 9.59V4H9V2z" />
      </svg>
    ),
  },
  {
    label: "Exams",
    path: ROUTE_PATHS.adminExams,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 4v2h10V7H7zm0 4v2h6v-2H7z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.adminDashboard]: "Admin Dashboard",
  [ROUTE_PATHS.adminTimetable]: "Timetable Management",
  [ROUTE_PATHS.adminStudentGroups]: "Student Groups",
  [ROUTE_PATHS.adminAssignments]: "Assignments",
  [ROUTE_PATHS.adminPresentations]: "Presentations",
  [ROUTE_PATHS.adminViva]: "Viva Management",
  [ROUTE_PATHS.adminLabTests]: "Lab Tests",
  [ROUTE_PATHS.adminExams]: "Exams",
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Admin Panel", [pathname]);

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
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle admin sidebar"
          >
            {isSidebarCollapsed ? ">" : "<"}
          </button>
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
            <p className="admin-chip-name">Admin</p>
            <p className="admin-chip-meta">{user?.username || user?.name || "admin"}</p>
          </section>
        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
