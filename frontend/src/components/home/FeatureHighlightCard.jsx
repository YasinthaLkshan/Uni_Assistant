const FeatureHighlightCard = ({ title, description, icon, tone }) => {
  return (
    <article className={`feature-card ${tone}`.trim()}>
      <div className="feature-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
};

export default FeatureHighlightCard;
