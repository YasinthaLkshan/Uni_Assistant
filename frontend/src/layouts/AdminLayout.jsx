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
];

const PAGE_TITLES = {
  [ROUTE_PATHS.adminDashboard]: "Admin Dashboard",
  [ROUTE_PATHS.adminStudentProfiles]: "Students",
  [ROUTE_PATHS.adminModules]: "Modules",
  [ROUTE_PATHS.adminTimetable]: "Timetable",
  [ROUTE_PATHS.adminAcademicEvents]: "Academic Events",
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Admin Panel", [pathname]);
  const isDashboard = pathname === ROUTE_PATHS.adminDashboard;

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
              <p className="admin-chip-name">Admin</p>
              <p className="admin-chip-meta">{user?.username || user?.name || "admin"}</p>
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
