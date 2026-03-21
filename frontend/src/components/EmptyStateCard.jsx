import GlassCard from "./GlassCard";

const EmptyStateCard = ({ title = "No data available", description = "Try adding new items to get started." }) => {
  return (
    <GlassCard className="empty-state-card">
      <span className="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-5.25l-2.82 3.05a.75.75 0 0 1-1.1 0L6.5 16H5.5A1.5 1.5 0 0 1 4 14.5v-9zm3.5 2.25a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9zm0 3a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6z" />
        </svg>
      </span>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state empty-state-lead">{description}</p>
    </GlassCard>
  );
};

export default EmptyStateCard;
