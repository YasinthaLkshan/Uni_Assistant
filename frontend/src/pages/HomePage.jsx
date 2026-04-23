import { Link, useNavigate } from "react-router-dom";

import FeatureHighlightCard from "../components/home/FeatureHighlightCard";
import LandingNav from "../components/home/LandingNav";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const FEATURES = [
  {
    title: "Smart Study Planner",
    description: "Build a realistic weekly plan from assignment priority, deadlines, and workload pressure.",
    icon: "PP",
    tone: "tone-sky",
  },
  {
    title: "Assignment Tracker",
    description: "Track every assignment, exam, and presentation in one clear timeline.",
    icon: "AT",
    tone: "tone-amber",
  },
  {
    title: "Workload Analysis",
    description: "See your workload score and pressure trends before deadlines become stress points.",
    icon: "WA",
    tone: "tone-violet",
  },
];

const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.login);
  };

  return (
    <div className="landing-page" id="home">
      <div className="landing-app-shell">
        <LandingNav isAuthenticated={isAuthenticated} user={user} />

        <section className="landing-shell landing-hero section-entrance" style={{ animationDelay: "80ms" }}>
          <div className="landing-hero-copy">
            <p className="eyebrow">Premium Academic Productivity Platform</p>
            {isAuthenticated ? <p className="home-student-greeting">Welcome back, {user?.name || "Student"}.</p> : null}
            <h1>Manage your academic life with clarity.</h1>
            <p>
              Uni Assistant helps you plan smarter, prioritize urgent work, and stay ahead of
              deadlines with a clean student-first productivity experience.
            </p>

            <div className="hero-surface-stack" aria-hidden="true">
              <span className="hero-surface-pill">Deadline Radar</span>
              <span className="hero-surface-pill">Focus Planner</span>
              <span className="hero-surface-pill">Weekly Insights</span>
            </div>

            <div className="hero-actions">
              <Link to={isAuthenticated ? ROUTE_PATHS.dashboard : ROUTE_PATHS.register} className="primary-btn">
                Get Started
              </Link>
              <Link to={ROUTE_PATHS.dashboard} className="ghost-btn">
                View Dashboard
              </Link>
              {isAuthenticated ? (
                <button type="button" className="ghost-btn hero-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          <div className="landing-hero-panel">
            <article className="hero-mock-card">
              <div className="pulse-card-head">
                <p className="preview-label">Today's Academic Pulse</p>
                <span className="pulse-level-badge">Medium</span>
              </div>

              <h3>Workload Overview</h3>

              <div className="pulse-gauge-wrap" aria-hidden="true">
                <div className="pulse-visual-grid">
                  <div className="pulse-gauge-track">
                    <span className="pulse-gauge-fill" />
                  </div>

                  <div className="pulse-ring-gauge">
                    <span>68%</span>
                  </div>
                </div>
                <p className="pulse-gauge-copy">68% workload utilization</p>

                <div className="pulse-sparkline">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="pulse-reminders">
                <article className="pulse-reminder-row">
                  <span>Database Assignment</span>
                  <strong>Tomorrow</strong>
                </article>
                <article className="pulse-reminder-row">
                  <span>HCI Presentation Slides</span>
                  <strong>2 Days</strong>
                </article>
              </div>

              <div className="hero-mock-metrics">
                <span>Focus Score 78</span>
                <span>3 Alerts</span>
                <span>5 Active Tasks</span>
              </div>
            </article>
          </div>
        </section>

        <section id="features" className="landing-shell landing-section section-entrance" style={{ animationDelay: "120ms" }}>
          <div className="landing-section-head">
            <p className="eyebrow">Feature Highlights</p>
            <h2>Everything students need to stay organized and focused</h2>
            <p className="landing-section-subcopy">Premium tools designed for planning, tracking, and workload clarity.</p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <FeatureHighlightCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                tone={feature.tone}
              />
            ))}
          </div>
        </section>

        <section id="about" className="landing-shell landing-cta section-entrance" style={{ animationDelay: "200ms" }}>
          <div className="landing-cta-copy">
            <p className="eyebrow">Simple And Focused</p>
            <h2>Everything you need in one student workspace</h2>
            <p>Track tasks, watch your workload, and keep up with deadlines without clutter.</p>

            <div className="hero-actions">
              <Link to={isAuthenticated ? ROUTE_PATHS.tasks : ROUTE_PATHS.register} className="primary-btn">
                Open Tasks
              </Link>
              <a href="#features" className="ghost-btn">
                Explore Features
              </a>
            </div>
          </div>

          <div className="landing-cta-visual" aria-hidden="true">
            <span className="cta-visual-card is-top" />
            <span className="cta-visual-card is-mid" />
            <span className="cta-visual-card is-bottom" />
            <span className="cta-visual-orb" />
          </div>
        </section>

        <footer className="landing-shell landing-footer">
          <div>
            <p className="landing-footer-brand">Uni Assistant</p>
            <p className="landing-footer-copy">Smart student productivity for focused academic progress.</p>
          </div>

          <nav className="landing-footer-links" aria-label="Footer links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <Link to={ROUTE_PATHS.dashboard}>Dashboard</Link>
            <Link to={ROUTE_PATHS.tasks}>Tasks</Link>
            <a href="#about">About</a>
          </nav>

          <p className="landing-footer-meta">© {new Date().getFullYear()} Uni Assistant. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
