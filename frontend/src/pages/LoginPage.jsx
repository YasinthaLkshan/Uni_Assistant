import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidStudentId = (value) => /^IT\d{8}$/i.test(value);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            {/* Cloud Icon SVG */}
            <svg
              className="modern-cloud-icon"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8ea1ff" />
                  <stop offset="100%" stopColor="#b08dff" />
                </linearGradient>
              </defs>
              <path
                d="M30 70c-8 0-14-6-14-14 0-7 5-12 11-13 1-9 8-15 16-15 6 0 12 3 15 8 2-6 7-10 13-10 8 0 14 6 14 14 0 1 0 2-1 3 7 1 12 7 12 14 0 8-6 14-14 14H30z"
                fill="url(#cloudGradient)"
                opacity="0.9"
              />
              <circle cx="60" cy="60" r="55" fill="none" stroke="url(#cloudGradient)" strokeWidth="1" opacity="0.3" />
            </svg>

            <h1 className="modern-login-title">UNI ASSISTANT</h1>
            <p className="modern-login-subtitle">Log in to your academic workspace</p>
          </div>

          {/* Auth Form */}
          <AuthForm 
            mode="login" 
            onSubmit={handleLogin} 
            loading={loading} 
            error={error}
          />

          {/* Footer Links */}
          <div className="modern-login-footer">
            <div className="footer-link-group">
              <p className="footer-primary-text">
                Need an account?{" "}
                <Link to={ROUTE_PATHS.register} className="footer-link">
                  Create one here
                </Link>
              </p>
            </div>

            <div className="footer-secondary-links">
              <Link to={ROUTE_PATHS.lecturerLogin} className="footer-secondary-link">
                Lecturer Portal
              </Link>
              <span className="footer-link-divider">·</span>
              <Link to={ROUTE_PATHS.adminLogin} className="footer-secondary-link">
                Admin Portal
              </Link>
              <span className="footer-link-divider">·</span>
              <Link to={ROUTE_PATHS.communityLogin} className="footer-secondary-link">
                FCSC Login
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="modern-login-page-footer"></footer>
      </div>
    </section>
  );
};

export default LoginPage;
