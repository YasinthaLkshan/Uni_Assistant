import { Link, useNavigate } from "react-router-dom";

import LandingNav from "../components/home/LandingNav";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const FEATURES = [
  {
    icon: "📋",
    title: "Smart Planning",
    description: "Plan your week realistically based on deadlines and workload",
  },
  {
    icon: "✓",
    title: "Track Everything",
    description: "Keep all assignments, exams, and tasks in one clear timeline",
  },
  {
    icon: "📊",
    title: "Workload Insights",
    description: "Understand your academic pressure before stress hits",
  },
  {
    icon: "⏰",
    title: "Stay Focused",
    description: "Get timely reminders for what matters most this week",
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
    <div className="landing-page-modern" id="home">
      <LandingNav isAuthenticated={isAuthenticated} user={user} />

      {/* Hero Section */}
      <section className="landing-hero-modern">
        <div className="hero-content">
          <p className="hero-subtitle">Your Academic Assistant</p>
          <h1>Study smarter, not harder</h1>
          <p className="hero-description">
            Keep your academic life organized with a clean, simple workspace designed just for you.
          </p>

          <div className="hero-buttons">
            <Link to={isAuthenticated ? ROUTE_PATHS.dashboard : ROUTE_PATHS.register} className="btn-primary">
              Get Started
            </Link>
            <Link to={ROUTE_PATHS.dashboard} className="btn-secondary">
              View Dashboard
            </Link>
            {isAuthenticated ? (
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            ) : null}
          </div>

          {isAuthenticated && (
            <p className="hero-welcome">Welcome back, <strong>{user?.name || "Student"}</strong>! 👋</p>
          )}
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="landing-features-modern">
        <div className="section-header">
          <h2>Everything you need to stay on top</h2>
          <p>Simple tools to help you manage your academic life with ease</p>
        </div>

        <div className="features-grid-modern">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card-modern">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-modern">
        <div className="cta-content">
          <h2>Ready to organize your studies?</h2>
          <p>Join thousands of students using Uni Assistant to manage their academic life</p>
          
          <div className="cta-buttons">
            <Link to={isAuthenticated ? ROUTE_PATHS.tasks : ROUTE_PATHS.register} className="btn-primary">
              Start Now
            </Link>
            <a href="#features" className="btn-tertiary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-modern">
        <div className="footer-content">
          <p className="footer-brand">Uni Assistant</p>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <Link to={ROUTE_PATHS.dashboard}>Dashboard</Link>
            <Link to={ROUTE_PATHS.tasks}>Tasks</Link>
          </nav>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Uni Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
