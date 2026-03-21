const InfoCard = ({ title, description, accent = "var(--mint)" }) => {
  return (
    <article className="info-card" style={{ "--card-accent": accent }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
};

export default InfoCard;
