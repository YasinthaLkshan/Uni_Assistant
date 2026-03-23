import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate(ROUTE_PATHS.adminDashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authUser = await login({ identifier: username, password });

      if (authUser?.role !== "admin") {
        logout();
        setError("Access denied. This portal is restricted to admin users.");
        return;
      }

      navigate(ROUTE_PATHS.adminDashboard, { replace: true });
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
    <section className="auth-page admin-login-page page-fade-in">
      <div className="login-bg-container">
        <div className="login-bg-overlay" />
      </div>

      <div className="login-content-wrapper">
        <article className="auth-panel admin-login-card glass-card section-entrance">
          <div className="login-header">
            <Logo variant="center" />
            <h1 className="login-title">Admin Portal</h1>
            <p className="admin-login-subtitle">Administrative access to manage academic operations</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Administrator Username
              </label>
              <div className="form-input-wrapper">
                <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter admin username"
                  autoComplete="username"
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

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" disabled={loading} className="primary-btn btn-submit">
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Admin Sign In"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="switch-auth">
              Student login? <Link to={ROUTE_PATHS.login}>Go to Student Login</Link>
            </p>
          </div>
        </article>

        <footer className="login-footer-text">
          <p>© 2024 Uni Assistant. Educational technology for modern universities.</p>
        </footer>
      </div>
    </section>
  );
};

export default AdminLoginPage;
