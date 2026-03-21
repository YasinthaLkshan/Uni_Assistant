import { Link } from "react-router-dom";

import InfoCard from "../components/InfoCard";
import { DASHBOARD_CARDS } from "../utils/constants";

const HomePage = () => {
  return (
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="eyebrow">Academic Productivity Platform</p>
        <h1>Organize your semester like a pro.</h1>
        <p>
          Uni Assistant gives students one clean place to plan assignments, track deadlines,
          and stay focused without overwhelm.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="primary-btn">
            Start for Free
          </Link>
          <Link to="/login" className="ghost-btn">
            I already have an account
          </Link>
        </div>
      </div>

      <div className="cards-grid">
        {DASHBOARD_CARDS.map((card) => (
          <InfoCard key={card.title} title={card.title} description={card.description} accent={card.accent} />
        ))}
      </div>
    </section>
  );
};

export default HomePage;
