import { useEffect, useState } from "react";

import api from "../services/api";
import { extractApiErrorMessage } from "../utils/error";

const PRIORITY_STYLES = {
  normal: { background: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  important: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  urgent: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StudentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/student/announcements");
        setAnnouncements(data.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <section className="dashboard section-entrance">
      <div className="glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Updates</p>
        <h2 style={{ margin: "0.3rem 0" }}>Announcements</h2>
        <p style={{ opacity: 0.7 }}>Latest announcements from your lecturers.</p>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p>Loading announcements...</p> : null}

        {!loading && announcements.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No announcements at the moment.</p>
        ) : null}

        {!loading && announcements.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
            {announcements.map((ann) => {
              const pStyle = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.normal;
              return (
                <article
                  key={ann._id}
                  className="glass-card"
                  style={{
                    padding: "1rem 1.2rem",
                    borderLeft: `3px solid ${pStyle.color}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{ann.title}</h3>
                    {ann.priority !== "normal" ? (
                      <span style={{
                        padding: "0.1rem 0.45rem",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        ...pStyle,
                      }}>
                        {ann.priority}
                      </span>
                    ) : null}
                  </div>
                  <p style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.2rem" }}>
                    {ann.moduleCode} {ann.moduleName ? `- ${ann.moduleName}` : ""} | By {ann.lecturer?.name || "Lecturer"} | {formatDate(ann.createdAt)}
                  </p>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.85, whiteSpace: "pre-wrap" }}>
                    {ann.content}
                  </p>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default StudentAnnouncementsPage;
