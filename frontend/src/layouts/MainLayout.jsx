import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { NotificationBadge } from "../components";
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
    label: "Tasks",
    path: ROUTE_PATHS.tasks,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4h11v2H9V4zM9 11h11v2H9v-2zM9 18h11v2H9v-2zM4.5 5.5l1.2-1.2 1.8 1.8-1.2 1.2-1.8-1.8zm0 7 1.2-1.2 1.8 1.8-1.2 1.2-1.8-1.8zm0 7 1.2-1.2 1.8 1.8-1.2 1.2-1.8-1.8z" />
      </svg>
    ),
  },
  {
    label: "GPA Calculator",
    path: ROUTE_PATHS.gpaCalculator,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v4h14V5H5zm3 6h2v2H8v-2zm0 4h2v2H8v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  [ROUTE_PATHS.dashboard]: "Dashboard Overview",
  [ROUTE_PATHS.tasks]: "Task Management",
  [ROUTE_PATHS.gpaCalculator]: "GPA Calculator",
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => PAGE_TITLES[pathname] || "Uni Assistant", [pathname]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-shell app-grid page-fade-in main-layout">
      <aside
        className={`sidebar main-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""} ${
          isMobileMenuOpen ? "is-open" : ""
        }`}
      >
        <div className="sidebar-head">
          <NavLink to={ROUTE_PATHS.dashboard} className="brand" onClick={closeMobileMenu}>
            Uni Assistant
          </NavLink>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? ">" : "<"}
          </button>
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
          Logout
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
              <p className="eyebrow">Student Productivity Suite</p>
              <h2 className="page-title">{pageTitle}</h2>
            </div>
          </div>

          <section className="user-panel" aria-label="User information">
            <p className="user-name">{user?.name || "Student"}</p>
            <p className="user-meta">{user?.email || "No email"}</p>
            <NotificationBadge unreadCount={0} className="header-notification-badge" />
          </section>
        </header>

        <main className="main-content content-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
