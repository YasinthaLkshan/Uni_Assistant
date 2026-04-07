import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidStudentId = (value) => /^IT\d{8}$/i.test(value);
const FCSC_AUTH_KEY = "uni_assistant_fcsc_auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFcscModalOpen, setIsFcscModalOpen] = useState(false);
  const [fcscCredentials, setFcscCredentials] = useState({
    username: "",
    password: "",
  });
  const [fcscError, setFcscError] = useState("");
  const [showFcscPassword, setShowFcscPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") {
        navigate(ROUTE_PATHS.adminDashboard, { replace: true });
        return;
      }

      navigate(ROUTE_PATHS.home, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleLogin = async (credentials) => {
    const loginIdentifier = credentials.email?.trim() || "";
    const password = credentials.password || "";

    if (!loginIdentifier || !password) {
      setError("Email or Student ID and password are required.");
      return;
    }

    if (!isValidEmail(loginIdentifier) && !isValidStudentId(loginIdentifier)) {
      setError("Please enter a valid email address or Student ID (IT + 8 numbers).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const authUser = await login({ identifier: loginIdentifier, password });

      if (authUser?.role === "admin") {
        navigate(ROUTE_PATHS.adminDashboard, { replace: true });
        return;
      }

      navigate(ROUTE_PATHS.home, { replace: true });
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openFcscModal = () => {
    setFcscError("");
    setFcscCredentials({ username: "", password: "" });
    setIsFcscModalOpen(true);
  };

  const closeFcscModal = () => {
    setIsFcscModalOpen(false);
    setFcscError("");
  };

  const handleFcscInputChange = (event) => {
    const { name, value } = event.target;
    setFcscError("");
    setFcscCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFcscLogin = (event) => {
    event.preventDefault();

    const username = fcscCredentials.username.trim();
    const password = fcscCredentials.password;

    if (username === "president" && password === "president123") {
      localStorage.setItem(FCSC_AUTH_KEY, "true");
      localStorage.setItem("uni_assistant_fcsc_user", username);
      closeFcscModal();
      navigate(ROUTE_PATHS.fcscDashboard, { replace: true });
      return;
    }

    setFcscError("Invalid credentials. Use president / president123");
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
            <h1 className="login-title">Uni Assistant</h1>
            <p className="login-subtitle">Log in to your academic workspace</p>
          </div>

          <AuthForm 
            mode="login" 
            onSubmit={handleLogin} 
            loading={loading} 
            error={error}
          />

          <div className="login-footer">
            <p className="switch-auth">
              Need an account? <Link to={ROUTE_PATHS.register}>Create one here</Link>
            </p>
            <div className="login-portal-links">
              <Link to={ROUTE_PATHS.lecturerLogin} className="portal-login-link">
                Lecturer Portal
              </Link>
              <Link to={ROUTE_PATHS.adminLogin} className="portal-login-link">
                Admin Portal
              </Link>
              <button type="button" className="community-login-link fcsc-login-trigger" onClick={openFcscModal}>
                FCSC Login
              </button>
            </div>
          </div>
        </div>

        <footer className="login-footer-text">
          <p>© 2024 Uni Assistant. Educational technology for modern universities.</p>
        </footer>
      </div>

      {isFcscModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fcsc-login-title" onClick={closeFcscModal}>
          <div className="modal-panel fcsc-modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="fcsc-modal-header">
              <div>
                <h2 id="fcsc-login-title" className="fcsc-modal-title">FCSC Portal</h2>
                <p className="fcsc-modal-subtitle">FCSC leadership access</p>
              </div>
              <button type="button" className="fcsc-close-btn" onClick={closeFcscModal} aria-label="Close FCSC login">
                ×
              </button>
            </div>

            <form className="auth-form fcsc-modal-form" onSubmit={handleFcscLogin}>
              <div className="form-group">
                <label htmlFor="fcsc-username" className="form-label">
                  Username
                </label>
                <div className="form-input-wrapper">
                  <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <input
                    id="fcsc-username"
                    type="text"
                    name="username"
                    value={fcscCredentials.username}
                    onChange={handleFcscInputChange}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fcsc-password" className="form-label">
                  Password
                </label>
                <div className="form-input-wrapper">
                  <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 1C6.48 1 2 5.48 2 11v10h4v-10c0-3.86 3.14-7 7-7s7 3.14 7 7v10h4V11c0-5.52-4.48-10-10-10zm3 11c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
                  </svg>
                  <input
                    id="fcsc-password"
                    type={showFcscPassword ? "text" : "password"}
                    name="password"
                    value={fcscCredentials.password}
                    onChange={handleFcscInputChange}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="fcsc-toggle-password"
                    onClick={() => setShowFcscPassword(!showFcscPassword)}
                    aria-label={showFcscPassword ? "Hide password" : "Show password"}
                  >
                    {showFcscPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {fcscError ? <p className="form-error">{fcscError}</p> : null}

              <button type="submit" className="primary-btn" style={{ marginTop: "0.5rem" }}>
                Login
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default LoginPage;
