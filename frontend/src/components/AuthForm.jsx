import { useState } from "react";

const AuthForm = ({ mode = "login", onSubmit, loading = false, error = "" }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isRegister = mode === "register";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <label>
          Full Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Alex Jordan"
            autoComplete="name"
            required
          />
        </label>
      )}

      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="student@university.edu"
          autoComplete="email"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={6}
          required
        />
      </label>

      {isRegister && (
        <label>
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
      )}

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" disabled={loading} className="primary-btn">
        {loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            <span>Please wait...</span>
          </>
        ) : isRegister ? (
          "Create Account"
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};

export default AuthForm;
