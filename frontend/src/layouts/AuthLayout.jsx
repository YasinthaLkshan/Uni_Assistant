import { Link, Outlet } from "react-router-dom";

import { ROUTE_PATHS } from "../routes/routePaths";

const AuthLayout = () => {
  return (
    <div className="app-shell page-fade-in">
      <header className="topbar">
        <Link to="/" className="brand">
          Uni Assistant
        </Link>
        <nav className="topbar-nav">
          <Link to={ROUTE_PATHS.login} className="nav-link">
            Login
          </Link>
          <Link to={ROUTE_PATHS.register} className="pill-link">
            Create Account
          </Link>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
