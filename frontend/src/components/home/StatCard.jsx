const StatCard = ({ value, label, delay = "0ms" }) => {
  return (
    <article className="impact-card section-entrance" style={{ animationDelay: delay }}>
      <p className="impact-value">{value}</p>
      <p className="impact-label">{label}</p>
    </article>
  );
};

export default StatCard;
