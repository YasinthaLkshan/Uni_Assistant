import { useEffect, useState } from "react";

import { extractApiErrorMessage } from "../../utils/error";
import api from "../../services/api";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const LecturerNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/lecturer/notices");
        setNotices(data.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Information</p>
        <h2>Notices</h2>
        <p>Announcements and updates from the administration.</p>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? <p>Loading notices...</p> : null}

        {!loading && notices.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No notices at the moment.</p>
        ) : null}

        {!loading && notices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {notices.map((notice) => (
              <article
                key={notice._id}
                className="admin-glass-card"
                style={{
                  padding: "1rem 1.2rem",
                  borderLeft: "3px solid #3b82f6",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{notice.title}</h3>
                  <span style={{ fontSize: "0.78rem", opacity: 0.6, whiteSpace: "nowrap", marginLeft: "1rem" }}>
                    {formatDate(notice.createdAt)}
                  </span>
                </div>
                {notice.description ? (
                  <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
                    {notice.description}
                  </p>
                ) : null}
                {notice.eventType ? (
                  <span style={{
                    display: "inline-block",
                    marginTop: "0.5rem",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    background: "rgba(255,255,255,0.08)",
                  }}>
                    {notice.eventType}
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
};

export default LecturerNoticesPage;
