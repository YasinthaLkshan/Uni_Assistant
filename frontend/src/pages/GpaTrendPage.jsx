import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { GlassCard, EmptyStateCard, PageHeader, SectionTitle, SecondaryButton } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { loadGpaHistory } from "../utils/gpaHistory";

const GpaTrendChart = ({ entries }) => {
  if (!entries.length) return null;

  const sorted = [...entries].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

  const maxGpa = 4;
  const minGpa = 0;
  const verticalPadding = 6;
  const chartHeight = 100 - verticalPadding * 2;

  const points = sorted.map((entry, index) => {
    const ratio = sorted.length > 1 ? index / (sorted.length - 1) : 0.5;
    const x = 4 + ratio * 92;
    const gpa = typeof entry.gpa === "number" ? entry.gpa : 0;
    const clampedGpa = Math.max(minGpa, Math.min(maxGpa, gpa));
    const valueRatio = (clampedGpa - minGpa) / (maxGpa - minGpa || 1);
    const y = 100 - (verticalPadding + valueRatio * chartHeight);
    return `${x},${y}`;
  });

  const labels = sorted.map((entry) => entry.semesterLabel || entry.semesterKey || "");

  return (
    <div className="gpa-trend-chart">
      <div className="gpa-trend-chart-inner">
        <svg
          className="gpa-trend-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gpaTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#gpaTrendGradient)" opacity="0.08" />

          <line x1="4" y1="90" x2="96" y2="90" stroke="#e4e4e7" strokeWidth="0.6" />
          <line x1="4" y1="58" x2="96" y2="58" stroke="#e4e4e7" strokeWidth="0.4" strokeDasharray="1.5 2" />
          <line x1="4" y1="26" x2="96" y2="26" stroke="#e4e4e7" strokeWidth="0.4" strokeDasharray="1.5 2" />

          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points.join(" ")}
          />

          {points.map((point, index) => {
            const [x, y] = point.split(",").map(Number);
            return (
              <g key={sorted[index].id || index}>
                <circle cx={x} cy={y} r={1.7} fill="#ffffff" stroke="#4f46e5" strokeWidth="0.9" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="gpa-trend-labels" aria-hidden="true">
        {labels.map((label, index) => (
          <span key={`${label || ""}-${index}`}>{label}</span>
        ))}
      </div>
    </div>
  );
};

const GpaTrendPage = () => {
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

  return (
    <section className="dashboard gpa-trend-page">
      <div className="section-entrance" style={{ animationDelay: "20ms", marginBottom: "1rem" }}>
        <Link
          to={ROUTE_PATHS.gpaHistory}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--ink-700)", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", padding: "0.4rem 0" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to GPA history
        </Link>
      </div>

      <GlassCard className="section-entrance" style={{ animationDelay: "40ms" }}>
        <PageHeader
          eyebrow="GPA insights"
          title="GPA trend"
          subtitle="See how your GPA has changed across semesters over time."
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

      <GlassCard as="section" className="ui-section section-entrance gpa-analysis-card" style={{ animationDelay: "80ms" }}>
        {!hasEntries && (
          <EmptyStateCard
            title="No GPA history yet"
            description="Use the GPA calculator, then save a calculation to see your GPA trend."
          />
        )}

        {hasEntries && stats && (
          <>
            <SectionTitle
              eyebrow="GPA trend"
              title="How your GPA is moving"
              subtitle="Each point below represents a saved semester GPA in your history."
            />

            <div className="gpa-analysis-body">
              <div className="metric-stack">
                <p className="metric-line">
                  Best GPA: <strong>{stats.bestGpa.toFixed(2)}</strong>
                </p>
                <p className="metric-line">
                  Average GPA across {stats.count} calculation{stats.count > 1 ? "s" : ""}: <strong>{stats.averageGpa.toFixed(2)}</strong>
                </p>
                {stats.lastUpdated && (
                  <p className="metric-line">
                    Last updated on <strong>{stats.lastUpdated.toLocaleDateString()}</strong>
                  </p>
                )}
              </div>

              <GpaTrendChart entries={entries} />
            </div>
          </>
        )}
      </GlassCard>
    </section>
  );
};

export default GpaTrendPage;
