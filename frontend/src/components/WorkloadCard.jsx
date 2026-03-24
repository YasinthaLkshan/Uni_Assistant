import GlassCard from "./GlassCard";
import SectionTitle from "./SectionTitle";
import StatusBadge from "./StatusBadge";

const getLevel = (workloadLevel) => {
	if (workloadLevel === "High") {
		return "danger";
	}

	if (workloadLevel === "Medium") {
		return "warning";
	}

	return "success";
};

const WorkloadCard = ({
	workloadScore = 0,
	workloadLevel = "Low",
	totalTasks = 0,
	urgentTasks = 0,
	examsNear = 0,
	studySuggestion = "1 hour/day",
	className = "",
	style,
}) => {
	const level = getLevel(workloadLevel);

	return (
		<GlassCard as="article" className={`workload-card ${className}`.trim()} style={style}>
			<SectionTitle
				eyebrow="Workload Summary"
				rightContent={<span className="workload-icon" aria-hidden="true">◔</span>}
			/>

			<div className="workload-hero-row">
				<div>
					<h3 className="workload-score">{workloadScore}</h3>
					<p className="workload-score-label">Current workload score</p>
				</div>

				<div className="workload-gauge" aria-hidden="true">
					<span className="workload-gauge-needle" />
					<span>{Math.max(0, Math.min(100, Number(workloadScore) || 0))}</span>
				</div>
			</div>

			<div className="workload-bars" aria-hidden="true">
				<span className="workload-bar is-1" />
				<span className="workload-bar is-2" />
				<span className="workload-bar is-3" />
				<span className="workload-bar is-4" />
			</div>

			<div className="metric-stack">
				<p className="metric-line"><strong>Total Tasks:</strong> {totalTasks}</p>
				<p className="metric-line"><strong>Urgent Tasks:</strong> {urgentTasks}</p>
				<p className="metric-line"><strong>Exams Near:</strong> {examsNear}</p>
				<p className="metric-line"><strong>Study Suggestion:</strong> {studySuggestion}</p>
			</div>

			<StatusBadge level={level} label={`${workloadLevel} Workload`} />
		</GlassCard>
	);
};

export default WorkloadCard;
