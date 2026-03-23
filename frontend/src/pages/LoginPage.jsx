import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

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
    const email = credentials.email?.trim() || "";
    const password = credentials.password || "";

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const authUser = await login({ email, password });

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
            <Link to={ROUTE_PATHS.adminLogin} className="admin-login-link">
              → Admin Portal
            </Link>
          </div>
        </div>

        <footer className="login-footer-text">
          <p>© 2024 Uni Assistant. Educational technology for modern universities.</p>
        </footer>
      </div>
    </section>
  );
};

export default LoginPage;
