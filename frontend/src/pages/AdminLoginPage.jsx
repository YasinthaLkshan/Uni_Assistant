import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  return (
    <section className="auth-page admin-login-page page-fade-in">
      <article className="auth-panel admin-login-card glass-card section-entrance">
        <p className="eyebrow">Administrative Access</p>
        <h2>Admin Login</h2>
        <p>Sign in with your admin username to access Uni Assistant administration tools.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Admin"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              "Login as Admin"
            )}
          </button>
        </form>

        <p className="switch-auth">
          Student login? <Link to={ROUTE_PATHS.login}>Go to Student Login</Link>
        </p>
      </article>
    </section>
  );
};

export default AdminLoginPage;
