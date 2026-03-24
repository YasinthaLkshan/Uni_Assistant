const AdminModulePage = ({ title, description }) => {
  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Admin Module</p>
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="admin-module-grid">
          <article className="admin-sub-card">
            <h3>Quick Actions</h3>
            <p>Create, update, and archive records with role-based access control.</p>
          </article>
          <article className="admin-sub-card">
            <h3>Data View</h3>
            <p>Filter by student group, assessment type, or timetable day in one place.</p>
          </article>
          <article className="admin-sub-card">
            <h3>Status</h3>
            <p>Track completion state and identify items requiring immediate review.</p>
          </article>
        </div>
      </article>
    </section>
  );
};

export default AdminModulePage;
