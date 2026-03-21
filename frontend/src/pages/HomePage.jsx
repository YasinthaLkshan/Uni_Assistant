import { Link } from "react-router-dom";

import FeatureHighlightCard from "../components/home/FeatureHighlightCard";
import LandingNav from "../components/home/LandingNav";
import PlatformPreview from "../components/home/PlatformPreview";
import StatCard from "../components/home/StatCard";
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
  {
    title: "Smart Task Recommendation",
    description: "Get intelligent suggestions on what to do next for maximum academic impact.",
    icon: "SR",
    tone: "tone-indigo",
  },
  {
    title: "Notifications and Alerts",
    description: "Receive timely reminders for urgent deadlines, quizzes, and high-priority tasks.",
    icon: "NA",
    tone: "tone-rose",
  },
  {
    title: "Progress Insights",
    description: "Understand your productivity rhythm with practical insights and weekly progress cues.",
    icon: "PI",
    tone: "tone-emerald",
  },
];

const IMPACT_STATS = [
  { value: "1,200+", label: "Tasks Organized" },
  { value: "450+", label: "Deadlines Managed" },
  { value: "860+", label: "Study Plans Generated" },
  { value: "980+", label: "Focus Recommendations" },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="landing-page" id="home">
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
          <div className="hero-actions">
            <Link to={isAuthenticated ? ROUTE_PATHS.dashboard : ROUTE_PATHS.register} className="primary-btn">
              Get Started
            </Link>
            <Link to={ROUTE_PATHS.dashboard} className="ghost-btn">
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="landing-hero-panel">
          <article className="hero-mock-card">
            <p className="preview-label">Today's Academic Pulse</p>
            <h3>Workload: Medium</h3>
            <p>2 urgent tasks pending, 1 exam this week, and a focused plan suggested.</p>
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

      <section id="about" className="landing-shell landing-section why-grid section-entrance" style={{ animationDelay: "160ms" }}>
        <div>
          <p className="eyebrow">Why Choose Uni Assistant</p>
          <h2>Built to reduce stress and improve your academic execution</h2>
          <p className="why-copy">
            Uni Assistant keeps your semester clear and structured. From daily planning to urgent
            deadline prioritization, it helps you make better decisions with less mental overhead.
          </p>
          <ul className="why-list">
            <li>Keeps students organized with one complete productivity workspace</li>
            <li>Reduces deadline stress through visible workload forecasting</li>
            <li>Prioritizes important work before urgency spikes</li>
            <li>Provides intelligent study guidance with actionable recommendations</li>
          </ul>
        </div>

        <div className="why-visual-stack">
          <article className="why-visual-card">
            <p>Weekly focus trend improved</p>
            <h3>+24%</h3>
          </article>
          <article className="why-visual-card">
            <p>Deadline completion rate</p>
            <h3>92%</h3>
          </article>
          <article className="why-visual-card">
            <p>Average daily study plan</p>
            <h3>2.5 hours</h3>
          </article>
        </div>
      </section>

      <section className="landing-shell landing-section section-entrance" style={{ animationDelay: "200ms" }}>
        <div className="landing-section-head compact-head">
          <p className="eyebrow">Impact Snapshot</p>
          <h2>Measured outcomes for student productivity</h2>
        </div>

        <div className="impact-grid">
          {IMPACT_STATS.map((item, index) => (
            <StatCard key={item.label} value={item.value} label={item.label} delay={`${240 + index * 35}ms`} />
          ))}
        </div>
      </section>

      <section className="landing-shell landing-section section-entrance" style={{ animationDelay: "240ms" }}>
        <div className="landing-section-head compact-head">
          <p className="eyebrow">Platform Preview</p>
          <h2>See how your dashboard brings everything together</h2>
        </div>

        <PlatformPreview />
      </section>

      <section className="landing-shell landing-cta section-entrance" style={{ animationDelay: "280ms" }}>
        <div>
          <p className="eyebrow">Ready To Start</p>
          <h2>Take control of your semester with Uni Assistant</h2>
          <p>Organize, prioritize, and execute with confidence from one clean productivity system.</p>
        </div>

        <div className="hero-actions">
          <Link to={isAuthenticated ? ROUTE_PATHS.tasks : ROUTE_PATHS.register} className="primary-btn">
            Start Organizing Now
          </Link>
          <a href="#features" className="ghost-btn">
            Explore Features
          </a>
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
  );
};

export default HomePage;
