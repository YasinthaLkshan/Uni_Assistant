import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { GlassCard, EmptyStateCard, PageHeader, SectionTitle, SecondaryButton, StatusBadge } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { clearGpaHistory, loadGpaHistory, removeGpaHistoryEntry } from "../utils/gpaHistory";

const GpaHistoryPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);

  const userId = user?._id || user?.id || user?.email || "anonymous";

  useEffect(() => {
    setEntries(loadGpaHistory(userId));
  }, [userId]);

  const hasEntries = entries.length > 0;

  const stats = useMemo(() => {
    if (!entries.length) {
      return null;
    }

    const gpas = entries.map((entry) => entry.gpa || 0);
    const best = Math.max(...gpas);
    const average = gpas.reduce((sum, value) => sum + value, 0) / gpas.length;

    const lastUpdated = entries[0]?.createdAt ? new Date(entries[0].createdAt) : null;

    return {
      count: entries.length,
      bestGpa: best,
      averageGpa: average,
      lastUpdated,
    };
  }, [entries]);

  const handleClearAll = () => {
    const confirmed = window.confirm("Clear all GPA history for this account?");
    if (!confirmed) return;

    clearGpaHistory(userId);
    setEntries([]);
  };

  const handleRemoveEntry = (entryId) => {
    const next = removeGpaHistoryEntry(userId, entryId);
    setEntries(next);
  };

  return (
    <section className="dashboard gpa-history-page">
      <div className="section-entrance" style={{ animationDelay: "20ms", marginBottom: "1rem" }}>
        <Link 
          to={ROUTE_PATHS.gpaCalculator} 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--ink-700)", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", padding: "0.4rem 0" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Calculator
        </Link>
      </div>
      <GlassCard className="section-entrance" style={{ animationDelay: "40ms" }}>
        <PageHeader
          eyebrow="GPA Insights"
          title="GPA Calculation History"
          subtitle="Every time you save a calculation, it is stored here so you can see how your GPA changes over time."
          rightContent={hasEntries && stats ? (
            <div className="gpa-history-stats">
              <p>
                <strong>{stats.count}</strong>
                {" "}
                saved calculations
              </p>
              <p>
                Best GPA:
                {" "}
                <strong>{stats.bestGpa.toFixed(2)}</strong>
              </p>
              <p>
                Average GPA:
                {" "}
                <strong>{stats.averageGpa.toFixed(2)}</strong>
              </p>
            </div>
          ) : null}
        />
      </GlassCard>

      <GlassCard as="section" className="ui-section section-entrance" style={{ animationDelay: "100ms" }}>
        <SectionTitle
          eyebrow="History"
          title="Saved GPA calculations"
          className="gpa-history-section-title"
          rightContent={hasEntries ? (
            <SecondaryButton type="button" onClick={handleClearAll}>
              Clear history
            </SecondaryButton>
          ) : null}
        />

        {!hasEntries && (
          <EmptyStateCard
            title="No GPA history yet"
            description="Use the GPA calculator, then click ‘Save this calculation’ to keep a record for this semester."
          />
        )}

        {hasEntries && (
          <div className="gpa-history-list">
            {entries.map((entry) => {
              const createdAt = entry.createdAt ? new Date(entry.createdAt) : null;

              return (
                <article key={entry.id} className="gpa-history-card">
                  <div className="gpa-history-main">
                    <div className="gpa-history-meta">
                      <p className="gpa-history-semester">
                        {entry.semesterLabel || entry.semesterKey || "Semester"}
                      </p>
                      {entry.courseLabel && (
                        <p className="gpa-history-specialization">{entry.courseLabel}</p>
                      )}
                      {createdAt && (
                        <p className="gpa-history-date">
                          Saved on
                          {" "}
                          {createdAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="gpa-history-gpa-wrap">
                      <p className="gpa-history-gpa">{entry.gpa.toFixed(2)}</p>
                      <p className="gpa-history-credits">{entry.totalCredits} credits</p>
                      <StatusBadge
                        level={entry.gpa >= 3.7 ? "success" : entry.gpa >= 3.0 ? "warning" : "danger"}
                        label={entry.gpa >= 3.7 ? "High" : entry.gpa >= 3.0 ? "Balanced" : "Needs attention"}
                      />
                    </div>
                  </div>

                  <div className="gpa-history-actions-row">
                    <button
                      type="button"
                      className="ghost-btn gpa-history-delete-btn"
                      onClick={() => handleRemoveEntry(entry.id)}
                    >
                      Remove from history
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </GlassCard>
    </section>
  );
};

export default GpaHistoryPage;
