import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
	EmptyStateCard,
	GlassCard,
	LoadingSpinner,
	PageHeader,
	RecommendationCard,
	SkeletonCard,
	SectionTitle,
	SecondaryButton,
	StatusBadge,
	WorkloadCard,
} from "../components";
import { useAuth } from "../hooks/useAuth";
import { getDashboardSummary } from "../services/dashboardService";
import { extractApiErrorMessage } from "../utils/error";
import { ROUTE_PATHS } from "../routes/routePaths";

const DEFAULT_SUMMARY = {
	todaysTasks: [],
	upcomingTasksCount: 0,
	workloadSummary: {
		workloadScore: 0,
		workloadLevel: "Low",
		studySuggestion: {
			suggestedStudyHoursPerDay: "1 hour/day",
		},
		breakdown: {
			totalTasks: 0,
			urgentTasks: 0,
			examsNear: 0,
		},
	},
	smartRecommendation: {
		title: "No recommendation yet",
		type: "general",
		urgencyLevel: "Low",
		message: "Create tasks to receive a smart recommendation.",
	},
	unreadNotificationCount: 0,
};

const normalizeSummary = (data = {}) => {
	const workloadSummary = data.workloadSummary || {};
	const breakdown = workloadSummary.breakdown || {};
	const studySuggestion = workloadSummary.studySuggestion || {};
	const smartRecommendation = data.smartRecommendation || {};

	return {
		todaysTasks: Array.isArray(data.todaysTasks) ? data.todaysTasks : [],
		upcomingTasksCount: Number(data.upcomingTasksCount || 0),
		workloadSummary: {
			workloadScore: Number(workloadSummary.workloadScore || 0),
			workloadLevel: workloadSummary.workloadLevel || "Low",
			studySuggestion: {
				suggestedStudyHoursPerDay: studySuggestion.suggestedStudyHoursPerDay || "1 hour/day",
			},
			breakdown: {
				totalTasks: Number(breakdown.totalTasks || 0),
				urgentTasks: Number(breakdown.urgentTasks || 0),
				examsNear: Number(breakdown.examsNear || 0),
			},
		},
		smartRecommendation: {
			title: smartRecommendation.title || "No recommendation yet",
			type: smartRecommendation.type || "general",
			urgencyLevel: smartRecommendation.urgencyLevel || "Low",
			deadline: smartRecommendation.deadline || null,
			message: smartRecommendation.message || "Focus on this task first",
		},
		unreadNotificationCount: Number(data.unreadNotificationCount || 0),
	};
};

const getLevelBadgeClass = (level) => {
	if (level === "High") {
		return "danger";
	}

	if (level === "Medium") {
		return "warning";
	}

	return "success";
};

const DashboardPage = () => {
	const { user } = useAuth();
	const [summary, setSummary] = useState(DEFAULT_SUMMARY);
	const [loading, setLoading] = useState(true);
	const [showLoadingShell, setShowLoadingShell] = useState(true);
	const [error, setError] = useState("");

	const loadDashboardSummary = useCallback(async () => {
		try {
			setError("");
			setLoading(true);
			const response = await getDashboardSummary();
			setSummary(normalizeSummary(response.data));
		} catch (err) {
			setError(extractApiErrorMessage(err));
			setSummary(DEFAULT_SUMMARY);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadDashboardSummary();
	}, [loadDashboardSummary]);

	useEffect(() => {
		if (loading) {
			setShowLoadingShell(true);
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setShowLoadingShell(false);
		}, 180);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [loading]);

	if (showLoadingShell) {
		return (
			<section className={`dashboard dashboard-page dashboard-premium loading-shell ${loading ? "is-entering" : "is-leaving"}`.trim()}>
				<GlassCard className="dashboard-loading-header section-entrance">
					<div className="dashboard-loading-copy">
						<span className="skeleton-block skeleton-eyebrow" />
						<span className="skeleton-block skeleton-hero" />
						<span className="skeleton-block skeleton-subline" />
					</div>
					<LoadingSpinner className="dashboard-inline-spinner" label="Loading your dashboard..." />
				</GlassCard>

				<div className="dashboard-grid">
					<SkeletonCard className="section-entrance" lines={4} />
					<SkeletonCard className="section-entrance" lines={4} />
					<SkeletonCard className="section-entrance" lines={3} />
				</div>

				<GlassCard as="section" className="ui-section dashboard-task-skeleton section-entrance">
					<div className="skeleton-task-row">
						<span className="skeleton-block skeleton-task-title" />
						<span className="skeleton-block skeleton-pill" />
					</div>
					<div className="skeleton-task-row">
						<span className="skeleton-block skeleton-task-title" />
						<span className="skeleton-block skeleton-pill" />
					</div>
					<div className="skeleton-task-row">
						<span className="skeleton-block skeleton-task-title" />
						<span className="skeleton-block skeleton-pill" />
					</div>
				</GlassCard>
			</section>
		);
	}

	if (error) {
		return (
			<section className="dashboard-page dashboard-premium">
				<EmptyStateCard
					title="Unable to load dashboard"
					description={error}
				/>
				<div className="tm-actions">
					<SecondaryButton type="button" onClick={loadDashboardSummary}>
						Try Again
					</SecondaryButton>
				</div>
			</section>
		);
	}

	return (
		<section className="dashboard dashboard-page dashboard-premium">
			<GlassCard className="section-entrance dashboard-welcome-card" style={{ animationDelay: "40ms" }}>
				<PageHeader
					eyebrow="Welcome Back"
					title={`Hello, ${user?.name || "Student"}`}
					subtitle="Here is your academic pulse for today. Stay focused and ahead."
					rightContent={
						<div className="dashboard-head-actions">
							<Link to={ROUTE_PATHS.fcscInforms} className="ui-btn is-ghost">
								FCSC Informs
							</Link>
							<Link to={ROUTE_PATHS.gpaCalculator} className="ui-btn is-ghost">
								Open GPA Calculator
							</Link>
							<Link to={ROUTE_PATHS.gpaHistory} className="ui-btn is-primary">
								GPA Calculation History
							</Link>
						</div>
					}
				/>

				<div className="dashboard-welcome-visual" aria-hidden="true">
					<span className="welcome-visual-grid" />
					<span className="welcome-visual-ring" />
					<span className="welcome-visual-orb" />
					<span className="welcome-visual-line is-a" />
					<span className="welcome-visual-line is-b" />
					<span className="welcome-visual-chip">Planner</span>
					<span className="welcome-visual-chip">Focus</span>
					<span className="welcome-visual-chip">Insights</span>
				</div>
			</GlassCard>

			<div className="dashboard-grid">
				<WorkloadCard
					className="section-entrance summary-card"
					style={{ animationDelay: "80ms" }}
					workloadScore={summary.workloadSummary.workloadScore}
					workloadLevel={summary.workloadSummary.workloadLevel}
					totalTasks={summary.workloadSummary.breakdown.totalTasks || summary.upcomingTasksCount}
					urgentTasks={summary.workloadSummary.breakdown.urgentTasks}
					examsNear={summary.workloadSummary.breakdown.examsNear}
					studySuggestion={summary.workloadSummary.studySuggestion?.suggestedStudyHoursPerDay}
				/>

				<RecommendationCard
					className="section-entrance summary-card"
					style={{ animationDelay: "140ms" }}
					title={summary.smartRecommendation.title || "No recommendation yet"}
					type={summary.smartRecommendation.type || "N/A"}
					urgencyLevel={summary.smartRecommendation.urgencyLevel || "Low"}
					deadline={summary.smartRecommendation.deadline}
					message={summary.smartRecommendation.message}
				/>

				<GlassCard as="article" className="section-entrance summary-card study-suggestion-card" style={{ animationDelay: "200ms" }}>
					<p className="eyebrow">Study Suggestion</p>
					<h3 className="study-hours-value">{summary.workloadSummary.studySuggestion?.suggestedStudyHoursPerDay || "1 hour/day"}</h3>
					<p className="study-suggestion-copy">
						Recommended daily focus time based on your current workload profile.
					</p>

					<div className="study-suggestion-visual" aria-hidden="true">
						<span className="study-suggestion-glow" />
						<span className="study-suggestion-line is-long" />
						<span className="study-suggestion-line is-mid" />
						<span className="study-suggestion-dot" />
					</div>

					<StatusBadge level="success" label="Consistency beats intensity" />
				</GlassCard>
			</div>

			<GlassCard as="section" className="ui-section section-entrance dashboard-tasks" style={{ animationDelay: "260ms" }}>
				<SectionTitle
					eyebrow="Today's Tasks"
					rightContent={<StatusBadge level="low" label={`${summary.todaysTasks.length} Due Today`} />}
					className="dashboard-tasks-head"
				/>

				{summary.todaysTasks.length ? (
					<div className="task-list">
						{summary.todaysTasks.map((task) => (
							<article key={task._id} className="task-item">
								<div>
									<h4>{task.title}</h4>
									<p>{task.type}</p>
								</div>
								<StatusBadge
									level={getLevelBadgeClass(task.urgencyLevel)}
									label={task.urgencyLevel || "Low"}
								/>
							</article>
						))}
					</div>
				) : (
					<div className="dashboard-empty-state">
						<div className="dashboard-empty-visual" aria-hidden="true">
							<span className="dashboard-empty-halo" />
							<span className="dashboard-empty-circle" />
							<span className="dashboard-empty-line is-1" />
							<span className="dashboard-empty-line is-2" />
							<span className="dashboard-empty-spark" />
						</div>
						<h3>No tasks due today</h3>
						<p>Great progress. You are currently clear for today.</p>
					</div>
				)}
			</GlassCard>
		</section>
	);
};

export default DashboardPage;
