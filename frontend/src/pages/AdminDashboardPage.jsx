import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <section className="admin-dash-shell page-fade-in">
      <article className="admin-dash-card">
        <p className="eyebrow">Admin Workspace</p>
        <h1>Welcome, {user?.name || user?.username || "Admin"}</h1>
        <p>
          You are signed in as an administrator. Manage platform configuration, users,
          and academic operations from this dashboard.
        </p>

        <div className="hero-actions">
          <Link to={ROUTE_PATHS.dashboard} className="primary-btn">
            Open Student Dashboard
          </Link>
          <Link to={ROUTE_PATHS.tasks} className="ghost-btn">
            View Tasks
          </Link>
          <button type="button" className="ui-btn is-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </article>
    </section>
  );
};

export default AdminDashboardPage;
