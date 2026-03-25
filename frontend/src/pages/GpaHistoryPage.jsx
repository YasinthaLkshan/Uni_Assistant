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

  const handleDownloadSheet = () => {
    if (!entries.length) return;

    const headerRow = ["Semester", "Course", "GPA", "Credits", "Saved On"];
    const rows = entries.map((entry) => {
      const createdAt = entry.createdAt ? new Date(entry.createdAt) : null;
      return [
        entry.semesterLabel || entry.semesterKey || "",
        entry.courseLabel || "",
        typeof entry.gpa === "number" ? entry.gpa.toFixed(2) : "",
        entry.totalCredits != null ? String(entry.totalCredits) : "",
        createdAt ? createdAt.toLocaleDateString() : "",
      ];
    });

    const escapeCell = (value) => {
      const stringValue = String(value ?? "");
      if (stringValue.includes(",") || stringValue.includes("\"")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csv = [headerRow, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `gpa-history-${userId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
          eyebrow={null}
          title="GPA Calculation History"
          subtitle={null}
          rightContent={hasEntries && stats ? (
            <div className="gpa-history-stats">
              <div className="metric-stack">
                <p className="metric-line">
                  <strong>{stats.count}</strong>
                  {" "}
                  saved calculations
                </p>
                <p className="metric-line">
                  Best GPA: <strong>{stats.bestGpa.toFixed(2)}</strong>
                </p>
                <p className="metric-line">
                  Average GPA: <strong>{stats.averageGpa.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          ) : null}
        />
      </GlassCard>

      <GlassCard as="section" className="ui-section section-entrance" style={{ animationDelay: "80ms" }}>
        <SectionTitle
          eyebrow="History"
          title="Saved GPA calculations"
          className="gpa-history-section-title"
          rightContent={hasEntries ? (
            <div className="gpa-history-header-actions">
              <Link to={ROUTE_PATHS.gpaTrendHistory} style={{ textDecoration: "none" }}>
                <SecondaryButton type="button">
                  GPA trend
                </SecondaryButton>
              </Link>
              <SecondaryButton type="button" onClick={handleDownloadSheet}>
                Download GPA sheet
              </SecondaryButton>
              <SecondaryButton type="button" onClick={handleClearAll}>
                Clear history
              </SecondaryButton>
            </div>
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
                      className="icon-btn gpa-history-delete-btn"
                      onClick={() => handleRemoveEntry(entry.id)}
                      aria-label="Delete this GPA entry from history"
                    >
                      <svg
                        aria-hidden="true"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                      </svg>
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
