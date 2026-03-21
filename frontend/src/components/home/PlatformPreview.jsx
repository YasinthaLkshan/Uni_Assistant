const PlatformPreview = () => {
  return (
    <div className="preview-grid">
      <article className="preview-card preview-workload">
        <p className="preview-label">Workload</p>
        <h4>72 / 100</h4>
        <p>Medium pressure this week. Focus on two urgent tasks today.</p>
      </article>

      <article className="preview-card preview-tasks">
        <p className="preview-label">Upcoming Tasks</p>
        <ul>
          <li>
            <span>Database Assignment</span>
            <strong>Tomorrow</strong>
          </li>
          <li>
            <span>Software Project Demo</span>
            <strong>3 days</strong>
          </li>
          <li>
            <span>Linear Algebra Quiz</span>
            <strong>Friday</strong>
          </li>
        </ul>
      </article>

      <article className="preview-card preview-recommendation">
        <p className="preview-label">Smart Recommendation</p>
        <h4>Prioritize Database Assignment</h4>
        <p>Allocate 2 focused hours now to reduce tomorrow's deadline stress.</p>
      </article>

      <article className="preview-card preview-notification">
        <p className="preview-label">Notifications</p>
        <h4>3 unread alerts</h4>
        <p>2 deadlines approaching and 1 workload update generated.</p>
      </article>
    </div>
  );
};

export default PlatformPreview;
