const FeatureHighlightCard = ({ title, description, icon, tone }) => {
  return (
    <article className={`feature-card ${tone}`.trim()}>
      <div className="feature-card-layout">
        <div className="feature-copy">
          <div className="feature-icon" aria-hidden="true">
            {icon}
          </div>
          <p className="feature-eyebrow">Academic Productivity</p>
          <h3>{title}</h3>
          <p>{description}</p>

          <div className="feature-chip-row" aria-hidden="true">
            <span>Plan</span>
            <span>Track</span>
            <span>Optimize</span>
          </div>
        </div>

        <div className="feature-illustration" aria-hidden="true">
          <span className="feature-illustration-main" />
          <span className="feature-illustration-sub" />
          <span className="feature-illustration-dot" />
        </div>
      </div>
    </article>
  );
};

export default FeatureHighlightCard;
