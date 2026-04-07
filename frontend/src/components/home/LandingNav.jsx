import { useState } from "react";
import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "../../routes/routePaths";

const LandingNav = ({ isAuthenticated, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = isAuthenticated ? user?.name || "Student" : "Guest Student";
  const initials = String(displayName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("") || "GS";

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="landing-nav-wrap section-entrance" style={{ animationDelay: "20ms" }}>
      <div className="landing-shell landing-nav">
        <Link to={ROUTE_PATHS.home} className="landing-brand" onClick={closeMenu}>
          Uni Assistant
        </Link>

        <button
          type="button"
          className="landing-menu-btn"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? "x" : "="}
        </button>

        <nav className={`landing-nav-links ${menuOpen ? "is-open" : ""}`.trim()}>
          <a href="#home" className="landing-nav-link is-active" onClick={closeMenu}>Home</a>
          <a href="#features" className="landing-nav-link" onClick={closeMenu}>Features</a>
          {isAuthenticated ? (
            <>
              <Link to={ROUTE_PATHS.dashboard} className="landing-nav-link" onClick={closeMenu}>Dashboard</Link>
              <Link to={ROUTE_PATHS.tasks} className="landing-nav-link" onClick={closeMenu}>Tasks</Link>
            </>
          ) : (
            <>
              <Link to={ROUTE_PATHS.login} className="landing-nav-link" onClick={closeMenu}>Student Login</Link>
              <Link to={ROUTE_PATHS.lecturerLogin} className="landing-nav-link" onClick={closeMenu}>Lecturer Login</Link>
              <Link to={ROUTE_PATHS.adminLogin} className="landing-nav-link" onClick={closeMenu}>Admin Login</Link>
            </>
          )}
          <a href="#about" className="landing-nav-link" onClick={closeMenu}>About</a>
        </nav>

        {isAuthenticated ? (
          <div className="landing-profile-chip" aria-label="Student profile">
            <span className="landing-avatar" aria-hidden="true">{initials}</span>
            <span className="landing-profile-meta">
              <strong>{displayName}</strong>
              <span className="landing-profile-status">
                <span className="landing-profile-dot" aria-hidden="true" />
                Active
              </span>
            </span>
          </div>
        ) : (
          <Link to={ROUTE_PATHS.login} className="primary-btn landing-login-btn" onClick={closeMenu}>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default LandingNav;
