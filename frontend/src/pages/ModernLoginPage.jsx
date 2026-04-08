import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { extractApiErrorMessage } from "../utils/error";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidStudentId = (value) => /^IT\d{8}$/i.test(value);

const ModernLoginPage = () => {
	const navigate = useNavigate();
	const { login, isAuthenticated, role } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [userType, setUserType] = useState("student"); // student or admin

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
		const loginIdentifier = credentials.email?.trim() || "";
		const password = credentials.password || "";

		if (!loginIdentifier || !password) {
			setError("Email or Student ID and password are required.");
			return;
		}

		if (!isValidEmail(loginIdentifier) && !isValidStudentId(loginIdentifier)) {
			setError("Please enter a valid email address or Student ID (IT + 8 numbers).");
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

	const handleSwitchToAdmin = () => {
		setUserType("admin");
		navigate(ROUTE_PATHS.adminLogin, { replace: true });
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

						<h1 className="modern-login-title">UNI ASSISTANT</h1>
						<p className="modern-login-subtitle">Log in to your academic workspace</p>
					</div>

					{/* Segmented Control Toggle */}
					<div className="modern-segmented-control">
						<button
							type="button"
							className={`segment-btn ${userType === "student" ? "active" : ""}`}
							onClick={() => setUserType("student")}
						>
							STUDENT
						</button>
						<button
							type="button"
							className={`segment-btn ${userType === "admin" ? "active" : ""}`}
							onClick={handleSwitchToAdmin}
						>
							ADMIN
						</button>
					</div>

					{/* Auth Form */}
					<AuthForm
						mode="login"
						onSubmit={handleLogin}
						loading={loading}
						error={error}
					/>

					{/* Footer Links */}
					<div className="modern-login-footer">
						<div className="footer-link-group">
							<p className="footer-primary-text">
								Need an account?{" "}
								<Link to={ROUTE_PATHS.register} className="footer-link">
									Create one here
								</Link>
							</p>
						</div>

						<div className="footer-secondary-links">
							<Link to={ROUTE_PATHS.adminLogin} className="footer-secondary-link">
								Go to Admin Portal
							</Link>
							<span className="footer-link-divider">·</span>
							<Link to={ROUTE_PATHS.communityLogin} className="footer-secondary-link">
								Go to FCSC Login
							</Link>
						</div>
					</div>
				</div>

				{/* Bottom Footer */}
				<footer className="modern-login-page-footer">
					<p>© 2024 Uni Assistant. Educational technology for modern universities.</p>
				</footer>
			</div>
		</section>
	);
};

export default ModernLoginPage;
