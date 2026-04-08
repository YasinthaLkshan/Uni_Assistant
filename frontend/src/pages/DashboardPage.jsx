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
	todaysCount: 0,
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
		todaysCount: Number(data.todaysCount || 0),
		upcomingTasksCount: Number(data.upcomingTasksCount || 0),
		workloadSummary: {
			workloadScore: Number(workloadSummary.workloadScore || 0),
			workloadLevel: workloadSummary.workloadLevel || "Low",
			studySuggestion: {
				level: studySuggestion.level || "Low",
				suggestedStudyHoursPerDay: studySuggestion.suggestedStudyHoursPerDay || "1 hour/day",
				focus: studySuggestion.focus || "Maintain long-term learning goals",
				strategy: studySuggestion.strategy || "Regular class notes review",
			},
			breakdown: {
				totalTasks: Number(breakdown.totalTasks || 0),
				urgentTasks: Number(breakdown.urgentTasks || 0),
				examsNear: Number(breakdown.examsNear || 0),
			},
			analysis: workloadSummary.analysis || {
				intensity: "Manageable",
				recommendation: "Focus on long-term preparation",
				complexity: 0,
			},
		},
		smartRecommendation: {
			taskId: smartRecommendation.taskId || null,
			title: smartRecommendation.title || "No recommendation yet",
			type: smartRecommendation.type || "general",
			urgencyLevel: smartRecommendation.urgencyLevel || "Low",
			deadline: smartRecommendation.deadline || null,
			daysLeft: smartRecommendation.daysLeft || null,
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

	const todaysPlan = [
		{
			label: "Focus Time",
			value: summary.workloadSummary.studySuggestion?.suggestedStudyHoursPerDay || "1 hour/day",
			note: "Recommended for today",
		},
		{
			label: "Priority Task",
			value: summary.smartRecommendation.title || "No priority task yet",
			note: summary.smartRecommendation.daysLeft !== null && summary.smartRecommendation.daysLeft !== undefined
				? `${summary.smartRecommendation.daysLeft} day(s) remaining`
				: "Add tasks for smart recommendations",
		},
		{
			label: "Urgent Load",
			value: `${summary.workloadSummary.breakdown.urgentTasks || 0} urgent task(s)`,
			note: `${summary.workloadSummary.breakdown.totalTasks || summary.upcomingTasksCount} total active task(s)`,
		},
	];

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
			<section className={`dashboard dashboard-page dashboard-premium dashboard-student-clean loading-shell ${loading ? "is-entering" : "is-leaving"}`.trim()}>
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
			<section className="dashboard-page dashboard-premium dashboard-student-clean">
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
		<section className="dashboard dashboard-page dashboard-premium dashboard-student-clean">
			<GlassCard className="section-entrance dashboard-welcome-card" style={{ animationDelay: "40ms" }}>
				<PageHeader
					eyebrow="Welcome Back"
					title={`Hello, ${user?.name || "Student"}`}
					subtitle="Your daily plan is ready. Stay focused with simple, clear priorities."
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

			<GlassCard as="section" className="section-entrance dashboard-plan-card" style={{ animationDelay: "60ms" }}>
				<SectionTitle
					eyebrow="Today's Plan"
					title="A simple roadmap for your study day"
					className="dashboard-plan-head"
				/>
				<div className="dashboard-plan-list">
					{todaysPlan.map((item) => (
						<article key={item.label} className="dashboard-plan-item">
							<p className="dashboard-plan-label">{item.label}</p>
							<h4 className="dashboard-plan-value">{item.value}</h4>
							<p className="dashboard-plan-note">{item.note}</p>
						</article>
					))}
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
					daysLeft={summary.smartRecommendation.daysLeft}
					message={summary.smartRecommendation.message}
				/>

				<GlassCard as="article" className="section-entrance summary-card study-suggestion-card" style={{ animationDelay: "200ms" }}>
					<p className="eyebrow">Study Suggestion</p>
					<h3 className="study-hours-value">{summary.workloadSummary.studySuggestion?.suggestedStudyHoursPerDay || "1 hour/day"}</h3>
					<p className="study-suggestion-copy">
						{summary.workloadSummary.studySuggestion?.focus || "Recommended daily focus time based on your current workload profile."}
					</p>

					<div className="study-suggestion-visual" aria-hidden="true">
						<span className="study-suggestion-glow" />
						<span className="study-suggestion-line is-long" />
						<span className="study-suggestion-line is-mid" />
						<span className="study-suggestion-dot" />
					</div>

					<StatusBadge level="success" label={summary.workloadSummary.studySuggestion?.strategy || "Consistency beats intensity"} />
				</GlassCard>
			</div>

			<GlassCard as="section" className="ui-section section-entrance dashboard-tasks" style={{ animationDelay: "260ms" }}>
				<SectionTitle
					eyebrow={summary.todaysCount > 0 ? "Today's Tasks" : "Preparation Tasks"}
					rightContent={
						<StatusBadge 
							level="low" 
							label={summary.todaysCount > 0 ? `${summary.todaysTasks.length} Due Today` : `${summary.todaysTasks.length} Next Priority`} 
						/>
					}
					className="dashboard-tasks-head"
				/>

				{summary.todaysTasks.length ? (
					<>
						{summary.todaysCount === 0 && summary.smartRecommendation.title !== "No recommendation yet" && (
							<div className="preparation-context-banner">
								<p>
									<strong>No tasks due today.</strong> Here are priority tasks to help you prepare for <strong>{summary.smartRecommendation.title}</strong> coming in <strong>{summary.smartRecommendation.daysLeft} day(s)</strong>.
								</p>
							</div>
						)}
						<div className="task-list">
							{summary.todaysTasks.map((task) => {
								const taskDate = task.deadline ? new Date(task.deadline) : null;
								const today = new Date();
								const isToday = taskDate && 
									taskDate.getDate() === today.getDate() &&
									taskDate.getMonth() === today.getMonth() &&
									taskDate.getFullYear() === today.getFullYear();
								const daysUntil = taskDate ? Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24)) : null;

								return (
									<article key={task._id} className="task-item">
										<div>
											<h4>{task.title}</h4>
											<div className="task-meta">
												<span className="task-type">{task.type}</span>
												{isToday ? (
													<span className="task-timing due-today">Due Today</span>
												) : daysUntil !== null && daysUntil > 0 ? (
													<span className="task-timing">{daysUntil} day{daysUntil > 1 ? 's' : ''} left</span>
												) : null}
											</div>
										</div>
										<StatusBadge
											level={getLevelBadgeClass(task.urgencyLevel)}
											label={task.urgencyLevel || "Low"}
										/>
									</article>
								);
							})}
						</div>
					</>
				) : (
					<div className="dashboard-empty-state">
						<div className="dashboard-empty-visual" aria-hidden="true">
							<span className="dashboard-empty-halo" />
							<span className="dashboard-empty-circle" />
							<span className="dashboard-empty-line is-1" />
							<span className="dashboard-empty-line is-2" />
							<span className="dashboard-empty-spark" />
						</div>
						<h3>No tasks to prepare</h3>
						<p>All caught up! Create tasks to organize your study plan.</p>
					</div>
				)}
			</GlassCard>
		</section>
	);
};

export default DashboardPage;
