import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidStudentId = (id) => /^IT\d{8}$/i.test(id);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (payload) => {
    const studentId = payload.studentId?.trim() || "";
    const name = payload.name?.trim() || "";
    const academicYear = Number(payload.academicYear);
    const semester = Number(payload.semester);
    const groupNumber = Number(payload.groupNumber);
    const email = payload.email?.trim() || "";
    const password = payload.password || "";
    const confirmPassword = payload.confirmPassword || "";

    if (!studentId || !name || !email || !password || !confirmPassword || !academicYear || !semester || !groupNumber) {
      setError("Student ID, name, academic year, semester, group number, email, password, and confirm password are required.");
      return;
    }

    const normalizedStudentId = studentId.toUpperCase();
    if (!isValidStudentId(normalizedStudentId)) {
      setError("Student ID must be in format IT followed by 8 numbers (e.g., IT12345678).");
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

    if (academicYear !== 3) {
      setError("Academic year must be Year 3.");
      return;
    }

    if (![1, 2].includes(semester)) {
      setError("Semester must be 1 or 2.");
      return;
    }

    if (![1, 2, 3].includes(groupNumber)) {
      setError("Group number must be 1, 2, or 3.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await register({
        studentId: normalizedStudentId,
        name,
        academicYear,
        semester,
        groupNumber,
        email,
        password,
      });
      navigate(ROUTE_PATHS.home);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page register-page page-fade-in">
      <div className="login-bg-container">
        <div className="login-bg-overlay" />
      </div>

      <div className="login-content-wrapper">
        <div className="auth-panel register-card glass-card">
          <div className="login-header">
            <Logo variant="center" />
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Join our academic platform and manage your semester</p>
          </div>

          <AuthForm mode="register" onSubmit={handleRegister} loading={loading} error={error} />

          <div className="login-footer">
            <p className="switch-auth">
              Already have an account? <Link to={ROUTE_PATHS.login}>Sign in here</Link>
            </p>
          </div>
        </div>

        <footer className="login-footer-text">
          <p>© 2024 Uni Assistant. Educational technology for modern universities.</p>
        </footer>
      </div>
    </section>
  );
};

export default RegisterPage;
