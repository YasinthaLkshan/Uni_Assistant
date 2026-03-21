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

      <h3 className="workload-score">Score: {workloadScore}</h3>
      <p className="metric-line">Total Tasks: {totalTasks}</p>
      <p className="metric-line">Urgent Tasks: {urgentTasks}</p>
      <p className="metric-line">Exams Near: {examsNear}</p>
      <p className="metric-line">Study Suggestion: {studySuggestion}</p>

      <StatusBadge level={level} label={`${workloadLevel} Workload`} />
    </GlassCard>
  );
};

export default WorkloadCard;
