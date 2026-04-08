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
    label: "My Modules",
    path: ROUTE_PATHS.lecturerModules,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h16v4H4V3zm0 7h16v11H4V10zm3 2v2h4v-2H7zm0 4v2h7v-2H7z" />
      </svg>
    ),
  },
  {
    label: "Schedule",
    path: ROUTE_PATHS.lecturerSchedule,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
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
    label: "Timetable",
    path: ROUTE_PATHS.lecturerTimetable,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10z" />
      </svg>
    ),
  },
  {
    label: "Academic Events",
    path: ROUTE_PATHS.lecturerEvents,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V9h14v10z" />
      </svg>
    ),
  },
  {
    label: "Students",
    path: ROUTE_PATHS.lecturerStudents,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
      </svg>
    ),
  },
  {
    label: "Materials",
    path: ROUTE_PATHS.lecturerMaterials,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h8v2H8v-2z" />
      </svg>
    ),
  },
  {
    label: "Exam Schedule",
    path: ROUTE_PATHS.lecturerExamSchedule,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V9h14v10zm-7-5l-5-5h3V6h4v3h3l-5 5z" />
      </svg>
    ),
  },
  {
    label: "Exam Papers",
    path: ROUTE_PATHS.lecturerExamSubmission,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
      </svg>
    ),
  },
  {
    label: "Vivas",
    path: ROUTE_PATHS.lecturerVivas,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    label: "Coursework",
    path: ROUTE_PATHS.lecturerCoursework,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.lecturerDashboard]: "Lecturer Dashboard",
  [ROUTE_PATHS.lecturerModules]: "My Modules",
  [ROUTE_PATHS.lecturerSchedule]: "Lecture Scheduling",
  [ROUTE_PATHS.lecturerChangeRequests]: "Change Requests",
  [ROUTE_PATHS.lecturerTimetable]: "Timetable",
  [ROUTE_PATHS.lecturerEvents]: "Academic Events",
  [ROUTE_PATHS.lecturerStudents]: "Students",
  [ROUTE_PATHS.lecturerMaterials]: "Materials",
  [ROUTE_PATHS.lecturerExamSchedule]: "Exam Schedule",
  [ROUTE_PATHS.lecturerExamSubmission]: "Exam Papers",
  [ROUTE_PATHS.lecturerVivas]: "Vivas",
  [ROUTE_PATHS.lecturerCoursework]: "Coursework",
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
            Uni Assistant Lecturer
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
