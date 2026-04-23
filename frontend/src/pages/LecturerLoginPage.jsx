import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const LecturerLoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "lecturer") {
      navigate(ROUTE_PATHS.lecturerDashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authUser = await login({ identifier: email, password });

      if (authUser?.role !== "lecturer") {
        logout();
        setError("Access denied. This portal is restricted to lecturer users.");
        return;
      }

      navigate(ROUTE_PATHS.lecturerDashboard, { replace: true });
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="modern-login-page">
      <div className="modern-login-bg">
        <div className="celestial-gradient" />
        <div className="geometric-lines" />
      </div>

      <div className="modern-login-container">
        <div className="modern-login-card">
          <div className="modern-login-header">
            <svg
              className="modern-cloud-icon"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lecturerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8ea1ff" />
                  <stop offset="100%" stopColor="#b08dff" />
                </linearGradient>
              </defs>
              <path
                d="M60 22L26 40l34 18 27-14v22h7V40L60 22zm-17.5 37.5V72c0 9.5 13.2 16.5 17.5 16.5S77.5 81.5 77.5 72V59.5L60 69l-17.5-9.5z"
                fill="url(#lecturerGradient)"
                opacity="0.9"
              />
              <circle cx="60" cy="60" r="55" fill="none" stroke="url(#lecturerGradient)" strokeWidth="1" opacity="0.3" />
            </svg>

            <h1 className="modern-login-title">LECTURER PORTAL</h1>
            <p className="modern-login-subtitle">Access your modules, events, and student management</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="form-input-wrapper">
                <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 1C6.48 1 2 5.48 2 11v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9c0-5.52-4.48-10-10-10zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="current-password"
                  minLength={6}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="form-toggle-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0-2C6.48 5 2 8.48 2 12s4.48 7 10 7 10-3.48 10-7-4.48-7-10-7z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error ? <p className="error-message">{error}</p> : null}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Lecturer Sign In"
              )}
            </button>
          </form>

          <div className="modern-login-footer">
            <div className="footer-link-group">
              <p className="footer-primary-text">
                Student login?{" "}
                <Link to={ROUTE_PATHS.login} className="footer-link">
                  Go to Student Login
                </Link>
              </p>
            </div>

            <div className="footer-secondary-links">
              <Link to={ROUTE_PATHS.adminLogin} className="footer-secondary-link">
                Admin Portal
              </Link>
              <span className="footer-link-divider">·</span>
              <Link to={ROUTE_PATHS.login} className="footer-secondary-link">
                Student Portal
              </Link>
              <span className="footer-link-divider">·</span>
              <Link to={ROUTE_PATHS.communityLogin} className="footer-secondary-link">
                FCSC Login
              </Link>
            </div>
          </div>
        </div>

        <footer className="modern-login-page-footer">
          <p>© 2024 Uni Assistant. Educational technology for modern universities.</p>
        </footer>
      </div>
    </section>
  );
};

export default LecturerLoginPage;
