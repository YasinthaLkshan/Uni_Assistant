import { useEffect, useState } from "react";

import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/error";

const SENTIMENT_STYLES = {
  positive: { background: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Positive" },
  neutral: { background: "rgba(148,163,184,0.12)", color: "#94a3b8", label: "Neutral" },
  negative: { background: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Negative" },
};

const INSIGHT_STYLES = {
  success: { border: "rgba(34,197,94,0.3)", bg: "rgba(34,197,94,0.08)", color: "#22c55e", icon: "✓" },
  warning: { border: "rgba(251,191,36,0.3)", bg: "rgba(251,191,36,0.08)", color: "#fbbf24", icon: "!" },
  info: { border: "rgba(99,102,241,0.3)", bg: "rgba(99,102,241,0.08)", color: "#818cf8", icon: "i" },
};

const RatingBar = ({ label, value, max = 5 }) => {
  const pct = ((value / max) * 100).toFixed(0);
  const color = value >= 4 ? "#22c55e" : value >= 3 ? "#fbbf24" : "#ef4444";

  return (
    <div style={{ marginBottom: "0.7rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
        <span style={{ opacity: 0.8 }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value} / {max}</span>
      </div>
      <div style={{
        height: "6px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "99px",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: "99px",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
};

const SentimentDonut = ({ breakdown, total }) => {
  if (total === 0) return <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>No data yet.</p>;

  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {["positive", "neutral", "negative"].map((key) => {
        const count = breakdown[key] || 0;
        const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
        const s = SENTIMENT_STYLES[key];
        return (
          <div
            key={key}
            style={{
              flex: "1 1 80px",
              textAlign: "center",
              padding: "0.8rem",
              borderRadius: "10px",
              background: s.background,
              border: `1px solid ${s.color}40`,
            }}
          >
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{pct}%</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.2rem", textTransform: "capitalize" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "0.72rem", opacity: 0.55 }}>{count} responses</div>
          </div>
        );
      })}
    </div>
  );
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const LecturerFeedbackPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/feedback/summary");
        setSummary(data.data);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section className="dashboard section-entrance">
        <div className="glass-card" style={{ padding: "1.4rem" }}>
          <p>Loading feedback analytics...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard section-entrance">
        <div className="glass-card" style={{ padding: "1.4rem" }}>
          <p className="form-error">{error}</p>
        </div>
      </section>
    );
  }

  const s = summary;

  return (
    <section className="admin-page-grid section-entrance">

      {/* Overview Card */}
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Analytics</p>
        <h2>Student Feedback Overview</h2>
        <p style={{ opacity: 0.7 }}>
          {s.total === 0
            ? "No feedback has been submitted yet."
            : `Based on ${s.total} student response${s.total !== 1 ? "s" : ""}.`}
        </p>

        {s.total > 0 ? (
          <>
            <div style={{ marginTop: "1.2rem" }}>
              <h4 style={{ margin: "0 0 0.8rem", fontSize: "0.9rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Average Ratings
              </h4>
              <RatingBar label="Overall Rating" value={s.averageRatings.overallRating} />
              <RatingBar label="Teaching Quality" value={s.averageRatings.teachingQuality} />
              <RatingBar label="Content Clarity" value={s.averageRatings.contentClarity} />
              <RatingBar label="Engagement Level" value={s.averageRatings.engagementLevel} />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.8rem", fontSize: "0.9rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Sentiment Breakdown
              </h4>
              <SentimentDonut breakdown={s.sentimentBreakdown} total={s.total} />
            </div>
          </>
        ) : null}
      </article>

      {/* Smart Insights */}
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Smart Analysis</p>
        <h2>Insights</h2>
        <p style={{ opacity: 0.7 }}>AI-generated insights from student feedback patterns.</p>

        {s.insights.length === 0 ? (
          <p style={{ opacity: 0.55, marginTop: "1rem", fontSize: "0.9rem" }}>
            Insights will appear once feedback is collected.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1rem" }}>
            {s.insights.map((insight, i) => {
              const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.8rem",
                    alignItems: "flex-start",
                    padding: "0.8rem 1rem",
                    borderRadius: "10px",
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                  }}
                >
                  <span style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: style.border,
                    color: style.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: "0.05rem",
                  }}>
                    {style.icon}
                  </span>
                  <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.9, lineHeight: 1.5 }}>
                    {insight.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* By Module */}
        {s.byModule.length > 0 ? (
          <div style={{ marginTop: "1.8rem" }}>
            <h4 style={{ margin: "0 0 0.8rem", fontSize: "0.9rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              By Module
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {s.byModule.map((mod) => (
                <div
                  key={mod.moduleCode}
                  style={{
                    padding: "0.8rem 1rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{mod.moduleCode}</span>
                      <span style={{ fontSize: "0.78rem", opacity: 0.6, marginLeft: "0.5rem" }}>
                        {mod.moduleName}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.78rem", opacity: 0.55 }}>{mod.count} response{mod.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.3rem", fontSize: "0.75rem" }}>
                    {[
                      ["Overall", mod.averageRatings.overallRatingAvg],
                      ["Teaching", mod.averageRatings.teachingQuality],
                      ["Clarity", mod.averageRatings.contentClarity],
                      ["Engagement", mod.averageRatings.engagementLevel],
                    ].map(([label, val]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 700, color: val >= 4 ? "#22c55e" : val >= 3 ? "#fbbf24" : "#ef4444" }}>
                          {val}
                        </div>
                        <div style={{ opacity: 0.55 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </article>

      {/* Recent Comments */}
      {s.recentComments.length > 0 ? (
        <article className="admin-glass-card admin-module-card" style={{ gridColumn: "1 / -1" }}>
          <p className="eyebrow">Student Voice</p>
          <h2>Recent Comments</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1rem" }}>
            {s.recentComments.map((c, i) => {
              const sStyle = SENTIMENT_STYLES[c.sentiment] || SENTIMENT_STYLES.neutral;
              return (
                <article
                  key={i}
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: `3px solid ${sStyle.color}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.studentName}</span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>&bull;</span>
                      <span style={{ fontSize: "0.78rem", opacity: 0.6 }}>{c.moduleCode}</span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>&bull;</span>
                      <span style={{ fontSize: "0.78rem", color: "#fbbf24" }}>
                        {"★".repeat(c.overallRating)}{"☆".repeat(5 - c.overallRating)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "5px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        ...sStyle,
                      }}>
                        {sStyle.label}
                      </span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.45 }}>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.85, lineHeight: 1.5, fontStyle: "italic" }}>
                    "{c.comment}"
                  </p>
                </article>
              );
            })}
          </div>
        </article>
      ) : null}
    </section>
  );
};

export default LecturerFeedbackPage;
