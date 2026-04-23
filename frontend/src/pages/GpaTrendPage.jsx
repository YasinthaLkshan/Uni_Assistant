import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyStateCard } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { loadGpaHistory } from "../utils/gpaHistory";

import "./GpaCalculatorPage.css";

const chartWidth = 760;
const chartHeight = 280;
const chartMargins = { top: 22, right: 24, bottom: 48, left: 42 };

const formatChartLabel = (entry) => {
  if (entry.semesterLabel) {
    return entry.semesterLabel;
  }

  if (entry.semesterKey) {
    return entry.semesterKey;
  }

  if (entry.createdAt) {
    const parsed = new Date(entry.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString();
    }
  }

  return "Entry";
};

const shouldShowXLabel = (index, total) => {
  if (total <= 7) {
    return true;
  }

  if (index === 0 || index === total - 1) {
    return true;
  }

  const step = Math.ceil(total / 5);
  return index % step === 0;
};

const buildSmoothPath = (points) => {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const controlX = (previous.x + current.x) / 2;
    path += ` C ${controlX} ${previous.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
};

const GpaTrendChart = ({ entries }) => {
  if (!entries.length) return null;

  const sorted = [...entries].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

  const maxGpa = 4;
  const minGpa = 0;
  const plotWidth = chartWidth - chartMargins.left - chartMargins.right;
  const plotHeight = chartHeight - chartMargins.top - chartMargins.bottom;
  const baselineY = chartHeight - chartMargins.bottom;

  const points = sorted.map((entry, index) => {
    const ratio = sorted.length > 1 ? index / (sorted.length - 1) : 0.5;
    const x = chartMargins.left + ratio * plotWidth;
    const gpa = typeof entry.gpa === "number" ? entry.gpa : 0;
    const clampedGpa = Math.max(minGpa, Math.min(maxGpa, gpa));
    const valueRatio = (clampedGpa - minGpa) / (maxGpa - minGpa || 1);
    const y = chartMargins.top + (1 - valueRatio) * plotHeight;

    return {
      id: entry.id || `${index}-${entry.createdAt || "entry"}`,
      x,
      y,
      gpa: clampedGpa,
      label: formatChartLabel(entry),
    };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : "";

  const yTicks = [4.0, 3.0, 2.0, 1.0, 0.0];

  return (
    <div className="modern-chart-container">
      <div className="gpa-trend-chart-wrap">
        <svg
          className="gpa-trend-svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gpaTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f77d8" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="gpaTrendLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f77d8" />
              <stop offset="60%" stopColor="#5b74e7" />
              <stop offset="100%" stopColor="#34a388" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const ratio = (tick - minGpa) / (maxGpa - minGpa || 1);
            const y = chartMargins.top + (1 - ratio) * plotHeight;

            return (
              <g key={`tick-${tick}`}>
                <line
                  x1={chartMargins.left}
                  y1={y}
                  x2={chartWidth - chartMargins.right}
                  y2={y}
                  stroke={tick === 0 ? "#c8d7ef" : "#dde7f6"}
                  strokeWidth={tick === 0 ? 1.1 : 0.9}
                  strokeDasharray={tick === 0 ? "0" : "3 4"}
                />
                <text
                  x={chartMargins.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6d7fa4"
                  fontWeight="600"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {areaPath ? <path d={areaPath} fill="url(#gpaTrendGradient)" /> : null}

          <path
            d={linePath}
            fill="none"
            stroke="url(#gpaTrendLine)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {points.map((point, index) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={7}
                fill="rgba(79, 119, 216, 0.18)"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={3.2}
                fill="#ffffff"
                stroke="#4f77d8"
                strokeWidth="2"
              />
              <title>{`${point.label}: ${point.gpa.toFixed(2)}`}</title>

              {shouldShowXLabel(index, points.length) ? (
                <text
                  x={point.x}
                  y={chartHeight - 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#5f739c"
                  fontWeight="600"
                >
                  {point.label.length > 18 ? `${point.label.slice(0, 18)}...` : point.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <div className="gpa-trend-legend">
        <span>Trend line shows your GPA progression from oldest to newest entry.</span>
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
