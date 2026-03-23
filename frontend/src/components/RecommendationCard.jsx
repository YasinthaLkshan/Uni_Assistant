import GlassCard from "./GlassCard";
import SectionTitle from "./SectionTitle";
import StatusBadge from "./StatusBadge";

const toBadgeLevel = (urgencyLevel) => {
	if (urgencyLevel === "High") {
		return "danger";
	}

	if (urgencyLevel === "Medium") {
		return "warning";
	}

	return "success";
};

const RecommendationCard = ({
	title = "No recommendation yet",
	type = "N/A",
	urgencyLevel = "Low",
	deadline,
	message = "Focus on this task first",
	className = "",
	style,
}) => {
	const deadlineText = deadline ? new Date(deadline).toLocaleString() : "N/A";

	return (
		<GlassCard as="article" className={`recommendation-card ${className}`.trim()} style={style}>
			<span className="recommendation-accent" aria-hidden="true" />
			<SectionTitle
				eyebrow="Smart Recommendation"
				rightContent={<span className="recommendation-icon" aria-hidden="true">✦</span>}
			/>

			<div className="recommendation-visual" aria-hidden="true">
				<span className="recommendation-orb is-left" />
				<span className="recommendation-orb is-right" />
				<span className="recommendation-prism" />
				<span className="recommendation-ray" />
			</div>

			<h3 className="recommendation-title">{title}</h3>
			<p className="recommendation-message">{message || "Focus on this task first"}</p>

			<div className="metric-stack">
				<p className="metric-line"><strong>Type:</strong> {type || "N/A"}</p>
				<p className="metric-line"><strong>Deadline:</strong> {deadlineText}</p>
			</div>

			<StatusBadge level={toBadgeLevel(urgencyLevel)} label={`Urgency: ${urgencyLevel || "Low"}`} />
		</GlassCard>
	);
};

export default RecommendationCard;
