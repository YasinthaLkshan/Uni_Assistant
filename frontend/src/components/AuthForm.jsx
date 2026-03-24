import { useState } from "react";

const AuthForm = ({ 
  mode = "login",
  onSubmit,
  loading = false,
  error = ""
}) => {
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    academicYear: "",
    semester: "",
    groupNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <div className="form-group">
          <label htmlFor="studentId" className="form-label">
            Student ID
          </label>
          <div className="form-input-wrapper">
            <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m-4-0a2 2 0 01-2-2V6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2m-4-0v2m0 0h2m-2 0h-2" />
            </svg>
            <input
              id="studentId"
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="IT12345678"
              autoComplete="off"
              className="form-input"
              pattern="^IT\d{8}$"
              title="Student ID must be in format IT followed by 8 numbers (e.g., IT12345678)"
              required
            />
          </div>
        </div>
      )}

      {isRegister && (
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <div className="form-input-wrapper">
            <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Jordan"
              autoComplete="name"
              className="form-input"
              required
            />
          </div>
        </div>
      )}

      {isRegister && (
        <div className="form-group">
          <label htmlFor="academicYear" className="form-label">
            Academic Year
          </label>
          <div className="form-input-wrapper">
            <select
              id="academicYear"
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select year</option>
              <option value="3">Year 3</option>
            </select>
          </div>
        </div>
      )}

      {isRegister && (
        <div className="form-group">
          <label htmlFor="semester" className="form-label">
            Semester
          </label>
          <div className="form-input-wrapper">
            <select
              id="semester"
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>
      )}

      {isRegister && (
        <div className="form-group">
          <label htmlFor="groupNumber" className="form-label">
            Group Number
          </label>
          <div className="form-input-wrapper">
            <select
              id="groupNumber"
              name="groupNumber"
              value={form.groupNumber}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select group</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          {isRegister ? "Email Address" : "Email or Student ID"}
        </label>
        <div className="form-input-wrapper">
          <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            id="email"
            type={isRegister ? "email" : "text"}
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={isRegister ? "student@university.edu" : "student@university.edu or IT12345678"}
            autoComplete={isRegister ? "email" : "username"}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="form-input-wrapper">
          <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 1C6.48 1 2 5.48 2 11v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9c0-5.52-4.48-10-10-10zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={6}
            className="form-input"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="form-toggle-btn"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex="-1"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0-2C6.48 5 2 8.48 2 12s4.48 7 10 7 10-3.48 10-7-4.48-7-10-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isRegister && (
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="form-input-wrapper">
            <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 1C6.48 1 2 5.48 2 11v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9c0-5.52-4.48-10-10-10zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={6}
              className="form-input"
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="form-toggle-btn"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              tabIndex="-1"
            >
              {showConfirmPassword ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0-2C6.48 5 2 8.48 2 12s4.48 7 10 7 10-3.48 10-7-4.48-7-10-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {error ? <p className="form-error">{error}</p> : null}


      <button type="submit" disabled={loading} className="primary-btn btn-submit">
        {loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            <span>Signing in...</span>
          </>
        ) : isRegister ? (
          "Create Account"
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};

export default AuthForm;
