import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyStateCard } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { loadGpaHistory } from "../utils/gpaHistory";

import "./GpaCalculatorPage.css";

const GpaTrendChart = ({ entries }) => {
  if (!entries.length) return null;

  const sorted = [...entries].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

  const maxGpa = 4;
  const minGpa = 0;
  const verticalPadding = 8;
  const chartHeight = 100 - verticalPadding * 2;

  const points = sorted.map((entry, index) => {
    const ratio = sorted.length > 1 ? index / (sorted.length - 1) : 0.5;
    const x = 5 + ratio * 90;
    const gpa = typeof entry.gpa === "number" ? entry.gpa : 0;
    const clampedGpa = Math.max(minGpa, Math.min(maxGpa, gpa));
    const valueRatio = (clampedGpa - minGpa) / (maxGpa - minGpa || 1);
    const y = 100 - (verticalPadding + valueRatio * chartHeight);
    return `${x},${y}`;
  });

  const labelItems = sorted.map((entry) => ({
    id: entry.id,
    label: entry.semesterLabel || entry.semesterKey || "",
    gpa: typeof entry.gpa === "number" ? entry.gpa : null,
  }));

  return (
    <div className="modern-chart-container">
      <div style={{ width: "100%", height: "200px" }}>
        <svg
          style={{ width: "100%", height: "100%", display: "block" }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gpaTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Gradient under curve */}
          {points.length > 1 && (
            <polygon
              fill="url(#gpaTrendGradient)"
              points={`5,100 ${points.join(" ")} ${points.slice(-1)[0].split(',')[0]},100`}
            />
          )}

          {/* Grid lines */}
          <line x1="0" y1="92" x2="100" y2="92" stroke="#e2e8f0" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1.5 2" />
          <line x1="0" y1="28" x2="100" y2="28" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1.5 2" />

          {/* Main Line connecting points */}
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points.join(" ")}
            filter="url(#glow)"
          />

          {/* Data Points */}
          {points.map((point, index) => {
            const [x, y] = point.split(",").map(Number);
            const entry = sorted[index];

            return (
              <g key={entry.id || index}>
                <circle
                  cx={x}
                  cy={y}
                  r={3.8}
                  fill="rgba(99, 102, 241, 0.15)"
                  stroke="none"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={1.8}
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="1.2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        {labelItems.map((item, index) => (
          <div key={`${item.id || item.label || ""}-${index}`} style={{ textAlign: "center", flex: 1, padding: "0 4px" }}>
            <span style={{ display: "block", fontWeight: "750", fontSize: "1rem", color: "#0f172a" }}>
              {item.gpa != null ? item.gpa.toFixed(2) : "--"}
            </span>
            <span style={{ display: "block", marginTop: "0.2rem", fontSize: "0.75rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </div>
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
    if (!entries.length) return null;

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
    <section className="modern-gpa-wrapper">
      <header className="modern-gpa-header">
        <div>
          <h1>GPA Trend</h1>
          <p style={{ color: "#64748b", margin: "0.2rem 0 0" }}>Visualize your academic journey over time.</p>
        </div>
        <Link to={ROUTE_PATHS.gpaHistory} className="history-link-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}>
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
          Back to History
        </Link>
      </header>

      {hasEntries && stats && (
        <div className="premium-glass-card" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2>Trend Summary</h2>
              <p className="subtitle">From {stats.count} calculations</p>
            </div>
            <div className="stats-bar-flex">
              <div className="glass-stat-item" style={{ borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.05)" }}>
                Best: <b style={{ color: "#10b981" }}>{stats.bestGpa.toFixed(2)}</b>
              </div>
              <div className="glass-stat-item" style={{ borderColor: "rgba(245, 158, 11, 0.4)", background: "rgba(245, 158, 11, 0.05)" }}>
                Average: <b style={{ color: "#f59e0b" }}>{stats.averageGpa.toFixed(2)}</b>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="premium-glass-card">
        <h2 style={{ marginBottom: "1.5rem" }}>Progression Chart</h2>
        
        {!hasEntries ? (
          <EmptyStateCard
            title="Not enough data"
            description="Use the GPA calculator and save multiple semesters to plot a trend."
          />
        ) : (
          <div>
            <GpaTrendChart entries={entries} />
            {stats.lastUpdated && (
              <p style={{ textAlign: "right", marginTop: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                Last updated on <strong>{stats.lastUpdated.toLocaleDateString()}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default GpaTrendPage;
