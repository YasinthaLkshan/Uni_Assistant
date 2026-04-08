import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path
                d="M30 70c-8 0-14-6-14-14 0-7 5-12 11-13 1-9 8-15 16-15 6 0 12 3 15 8 2-6 7-10 13-10 8 0 14 6 14 14 0 1 0 2-1 3 7 1 12 7 12 14 0 8-6 14-14 14H30z"
                fill="url(#cloudGradient)"
                opacity="0.9"
              />
              <circle cx="60" cy="60" r="55" fill="none" stroke="url(#cloudGradient)" strokeWidth="1" opacity="0.3" />
            </svg>

            <h1 className="modern-login-title">CREATE ACCOUNT</h1>
            <p className="modern-login-subtitle">Join our academic platform and manage your semester</p>
          </div>

          {/* Auth Form */}
          <AuthForm mode="register" onSubmit={handleRegister} loading={loading} error={error} />

          {/* Footer Links */}
          <div className="modern-login-footer">
            <div className="footer-link-group">
              <p className="footer-primary-text">
                Already have an account?{" "}
                <Link to={ROUTE_PATHS.login} className="footer-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="modern-login-page-footer"></footer>
      </div>
    </section>
  );
};

export default RegisterPage;
