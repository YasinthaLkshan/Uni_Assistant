import { Link, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const isHomeRoute = pathname === ROUTE_PATHS.home;
  const isFcscPage = pathname === ROUTE_PATHS.fcscDashboard;
  const shouldShowTopbar = !isHomeRoute && !isFcscPage;

  return (
    <div className={`${isHomeRoute ? "auth-home-layout" : "app-shell"} page-fade-in`.trim()}>
      {shouldShowTopbar ? (
        <header className="topbar">
          <Link to="/" className="brand">
            Uni Assistant
          </Link>
          <nav className="topbar-nav">
            {isAuthenticated ? (
              <p className="topbar-student-name">Student: {user?.name || "Student"}</p>
            ) : (
              <>
                <Link to={ROUTE_PATHS.login} className="nav-link">
                  Login
                </Link>
                <Link to={ROUTE_PATHS.register} className="pill-link">
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </header>
      ) : null}
      <main className={`main-content ${isHomeRoute ? "main-content-home" : ""}`.trim()}>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
