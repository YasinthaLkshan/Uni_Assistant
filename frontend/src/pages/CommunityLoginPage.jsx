import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ROUTE_PATHS } from "../routes/routePaths";

const COMMUNITY_USERNAME = "president";
const COMMUNITY_PASSWORD = "president@123";
const FCSC_AUTH_KEY = "uni_assistant_fcsc_auth";

const CommunityLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: COMMUNITY_USERNAME,
    password: COMMUNITY_PASSWORD,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const isCommunityAuthenticated = localStorage.getItem(FCSC_AUTH_KEY) === "true";
    if (isCommunityAuthenticated) {
      navigate(ROUTE_PATHS.fcscDashboard, { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const username = form.username.trim();

    if (username === COMMUNITY_USERNAME && form.password === COMMUNITY_PASSWORD) {
      localStorage.setItem(FCSC_AUTH_KEY, "true");
      setError("");
      navigate(ROUTE_PATHS.fcscDashboard, { replace: true });
      return;
    }

    setError("Invalid username or password. Use president / president@123.");
  };

  return (
    <section className="modern-login-page">
      {/* Celestial Gradient Background */}
      <div className="modern-login-bg">
        <div className="celestial-gradient" />
        <div className="geometric-lines" />
      </div>

      {/* Main Content */}
      <div className="modern-login-container">
        <div className="modern-login-card">
          {/* Header Section */}
          <div className="modern-login-header">
            {/* Shield Icon SVG for Community */}
            <svg
              className="modern-cloud-icon"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path
                d="M60 10 L30 25 L30 50 C30 80 60 100 60 100 C60 100 90 80 90 50 L90 25 L60 10 Z"
                fill="url(#communityGradient)"
                opacity="0.9"
                stroke="url(#communityGradient)"
                strokeWidth="2"
              />
              <path
                d="M55 55 L60 50 L65 55 M60 50 L60 65 M50 60 L70 60"
                stroke="white"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              <circle cx="60" cy="60" r="55" fill="none" stroke="url(#communityGradient)" strokeWidth="1" opacity="0.3" />
            </svg>

            <h1 className="modern-login-title">COMMUNITY PORTAL</h1>
            <p className="modern-login-subtitle">FCSC leadership access</p>
          </div>

          {/* Auth Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="community-username" className="form-label">Username</label>
              <div className="form-input-wrapper">
                <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <input
                  id="community-username"
                  name="username"
                  className="form-input"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="community-password" className="form-label">Password</label>
              <div className="form-input-wrapper">
                <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 1C6.48 1 2 5.48 2 11v10h4v-10c0-3.86 3.14-7 7-7s7 3.14 7 7v10h4V11c0-5.52-4.48-10-10-10zm3 11c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
                </svg>
                <input
                  id="community-password"
                  name="password"
                  className="form-input"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="modern-login-card submit-btn">Login</button>
          </form>

          {/* Footer Links */}
          <div className="modern-login-footer">
            <div className="footer-link-group">
              <p className="footer-primary-text">
                <Link to={ROUTE_PATHS.login} className="footer-link">
                  ← Back to Student Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="modern-login-page-footer"></footer>
      </div>
    </section>
  );
};

export default CommunityLoginPage;