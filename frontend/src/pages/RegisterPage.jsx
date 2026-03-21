import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { extractApiErrorMessage } from "../utils/error";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (payload) => {
    try {
      setError("");
      setLoading(true);
      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h2>Create your account</h2>
        <p>Set up your Uni Assistant workspace in under one minute.</p>
        <AuthForm mode="register" onSubmit={handleRegister} loading={loading} error={error} />
        <p className="switch-auth">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
