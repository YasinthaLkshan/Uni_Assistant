import { useState } from "react";
import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "../../routes/routePaths";

const LandingNav = ({ isAuthenticated, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <Link to={ROUTE_PATHS.dashboard} onClick={closeMenu}>Dashboard</Link>
          <Link to={ROUTE_PATHS.tasks} onClick={closeMenu}>Tasks</Link>
          <a href="#about" onClick={closeMenu}>About</a>
        </nav>

        <div className="landing-profile-chip" aria-label="Student profile">
          <span className="landing-profile-dot" aria-hidden="true" />
          <span>{isAuthenticated ? user?.name || "Student" : "Guest Student"}</span>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
