import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import { ROUTE_PATHS } from "../routes/routePaths";

const COMMUNITY_USERNAME = "president";
const COMMUNITY_PASSWORD = "president@123";
const COMMUNITY_AUTH_KEY = "uni_assistant_community_auth";

const CommunityLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: COMMUNITY_USERNAME,
    password: COMMUNITY_PASSWORD,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const isCommunityAuthenticated = localStorage.getItem(COMMUNITY_AUTH_KEY) === "true";
    if (isCommunityAuthenticated) {
      navigate(ROUTE_PATHS.communityDashboard, { replace: true });
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
      localStorage.setItem(COMMUNITY_AUTH_KEY, "true");
      setError("");
      navigate(ROUTE_PATHS.communityDashboard, { replace: true });
      return;
    }

    setError("Invalid username or password. Use president / president@123.");
  };

  return (
    <section className="auth-page login-page page-fade-in">
      <div className="login-bg-container">
        <div className="login-bg-overlay" />
      </div>

      <div className="login-content-wrapper">
        <div className="auth-panel login-card glass-card">
          <div className="login-header">
            <Logo variant="center" />
            <h1 className="login-title">Community Login</h1>
            <p className="login-subtitle">Sign in to the community dashboard</p>
          </div>

          <form className="form-shell community-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="community-username" className="form-label">Username</label>
              <div className="form-input-wrapper">
                <input
                  id="community-username"
                  name="username"
                  className="ui-input"
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
                <input
                  id="community-password"
                  name="password"
                  className="ui-input"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="primary-btn btn-submit">Login</button>
          </form>

          <div className="login-footer">
            <Link to={ROUTE_PATHS.login} className="admin-login-link">← Back to Student Login</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityLoginPage;