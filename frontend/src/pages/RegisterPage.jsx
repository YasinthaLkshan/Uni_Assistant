import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (payload) => {
    const name = payload.name?.trim() || "";
    const email = payload.email?.trim() || "";
    const password = payload.password || "";
    const confirmPassword = payload.confirmPassword || "";

    if (!name || !email || !password || !confirmPassword) {
      setError("Name, email, password, and confirm password are required.");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await register({ name, email, password });
      navigate(ROUTE_PATHS.dashboard);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page register-page page-fade-in">
      <div className="auth-panel register-card glass-card">
        <div className="login-header">
          <Logo variant="center" />
          <p className="login-subtitle">Create your account and take control of your semester</p>
        </div>

        <AuthForm mode="register" onSubmit={handleRegister} loading={loading} error={error} />

        <p className="switch-auth">
          Already have an account? <Link to={ROUTE_PATHS.login}>Login</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
