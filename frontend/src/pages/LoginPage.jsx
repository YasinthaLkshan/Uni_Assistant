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

      navigate(ROUTE_PATHS.dashboard, { replace: true });
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

      navigate(ROUTE_PATHS.dashboard, { replace: true });
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page login-page page-fade-in">
      <div className="auth-panel login-card glass-card">
        <div className="login-header">
          <Logo variant="center" />
          <p className="login-subtitle">Sign in to continue to your academic workspace</p>
        </div>

        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />

        <p className="switch-auth">
          Need an account? <Link to={ROUTE_PATHS.register}>Register here</Link>
        </p>
        <div className="switch-auth">
          <Link to={ROUTE_PATHS.adminLogin} className="ui-btn is-ghost">
            Go to Admin Login
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
