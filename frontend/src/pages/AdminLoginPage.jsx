import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate(ROUTE_PATHS.adminDashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (credentials) => {
    const loginIdentifier = credentials.email?.trim() || "";
    const password = credentials.password || "";

    if (!loginIdentifier || !password) {
      setError("Username/Email and password are required.");
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

  const handleSwitchToStudent = () => {
    navigate(ROUTE_PATHS.login, { replace: true });
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
            {/* Shield Icon SVG for Admin */}
            <svg
              className="modern-cloud-icon"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path
                d="M60 10 L30 25 L30 50 C30 80 60 100 60 100 C60 100 90 80 90 50 L90 25 L60 10 Z"
                fill="url(#shieldGradient)"
                opacity="0.9"
                stroke="url(#shieldGradient)"
                strokeWidth="2"
              />
              <path
                d="M50 60 L55 65 L75 50"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              <circle cx="60" cy="60" r="55" fill="none" stroke="url(#shieldGradient)" strokeWidth="1" opacity="0.3" />
            </svg>

            <h1 className="modern-login-title">ADMIN PORTAL</h1>
            <p className="modern-login-subtitle">Administrative access to manage academic operations</p>
          </div>

          {/* Auth Form */}
          <AuthForm
            mode="login"
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            isAdmin={true}
          />

          {/* Footer Links */}
          <div className="modern-login-footer">
            <div className="footer-link-group">
              <p className="footer-primary-text">
                Back to students?{" "}
                <Link to={ROUTE_PATHS.login} className="footer-link">
                  Go to Student Login
                </Link>
              </p>
            </div>

            <div className="footer-secondary-links">
              <span className="footer-secondary-link">
                Protected Admin Area
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="modern-login-page-footer"></footer>
      </div>
    </section>
  );
};

export default AdminLoginPage;