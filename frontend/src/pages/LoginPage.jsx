import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTE_PATHS.home, { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      await login({ email, password });
      navigate(ROUTE_PATHS.home, { replace: true });
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page login-page page-fade-in">
      <div className="auth-panel login-card glass-card">
        <p className="eyebrow">Secure Access</p>
        <h2>Welcome back</h2>
        <p>Sign in to continue planning tasks, tracking deadlines, and improving your study rhythm.</p>
        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />
        <p className="switch-auth">
          Need an account? <Link to={ROUTE_PATHS.register}>Register here</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
