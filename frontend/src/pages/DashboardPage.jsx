import InfoCard from "../components/InfoCard";
import { useAuth } from "../hooks/useAuth";
import { DASHBOARD_CARDS } from "../utils/constants";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <section className="dashboard">
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Personal Dashboard</p>
          <h1>Hello, {user?.name || "Student"}</h1>
          <p>Your centralized overview for courses, deadlines, and next actions.</p>
        </div>
        <button type="button" className="ghost-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="cards-grid">
        {DASHBOARD_CARDS.map((card) => (
          <InfoCard key={card.title} title={card.title} description={card.description} accent={card.accent} />
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
