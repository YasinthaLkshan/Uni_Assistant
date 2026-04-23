import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyStateCard } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "../routes/routePaths";
import { clearGpaHistory, loadGpaHistory, removeGpaHistoryEntry } from "../utils/gpaHistory";
import { exportGpaHistoryPdf } from "../utils/gpaPdf";

import "./GpaCalculatorPage.css";

const GpaHistoryPage = () => {
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
    if (!entries.length || !stats) return;

    exportGpaHistoryPdf({
      user,
      entries,
      stats,
    });
  };

  return (
    <section className="modern-gpa-wrapper gpa-history-clean">
      <header className="modern-gpa-header">
        <div className="gpa-history-head-copy">
          <h1>GPA History</h1>
          <p className="gpa-history-subtitle">Review your beautifully tracked academic performance.</p>
        </div>
        <Link to={ROUTE_PATHS.gpaCalculator} className="history-link-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}>
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
          Back to Calculator
        </Link>
      </header>

      {hasEntries && stats && (
        <div className="premium-glass-card gpa-history-metrics-card">
          <div className="gpa-history-metrics-head">
            <div>
              <h2>History Metrics</h2>
              <p className="subtitle">Breakdown of your saved performance</p>
            </div>
            <div className="stats-bar-flex">
              <div className="glass-stat-item stat-records">
                Records: <b>{stats.count}</b>
              </div>
              <div className="glass-stat-item stat-best">
                Best GPA: <b>{stats.bestGpa.toFixed(2)}</b>
              </div>
              <div className="glass-stat-item stat-average">
                Average GPA: <b>{stats.averageGpa.toFixed(2)}</b>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="premium-glass-card gpa-history-list-card">
        <div className="gpa-history-actions-head">
          <h2>Saved Calculations</h2>
          {hasEntries && (
            <div className="modern-actions" style={{ marginTop: 0 }}>
              <Link
                to={ROUTE_PATHS.gpaTrendHistory}
                className="btn-add gpa-trend-link-btn"
              >
                Show Trend
              </Link>
              <button className="btn-add" onClick={handleDownloadSheet}>Export Sheet</button>
              <button className="btn-reset" onClick={handleClearAll} style={{ color: "#ef4444" }}>Clear History</button>
            </div>
          )}
        </div>

        {!hasEntries ? (
          <EmptyStateCard
            title="No history found"
            description="Use the GPA calculator and hit save to start building your academic timeline."
          />
        ) : (
          <div>
            {entries.map((entry) => {
              const createdAt = entry.createdAt ? new Date(entry.createdAt) : null;
              const isExcellent = entry.gpa >= 3.7;
              const gpaTone = entry.gpa >= 3.7 ? "excellent" : entry.gpa >= 3.0 ? "good" : entry.gpa >= 2.0 ? "average" : "warning";
              
              return (
                <div key={entry.id} className={`modern-history-card is-${gpaTone}`}>
                  <div className="gpa-history-item-main">
                    <div className="gpa-badge">
                      <span>{entry.gpa.toFixed(2)}</span>
                    </div>
                    <div className="history-info-group">
                      <div className="gpa-history-title-row">
                        <h4>{entry.semesterLabel || entry.semesterKey || "Semester"}</h4>
                        {isExcellent && <span className="gpa-honors-pill">DEAN'S LIST</span>}
                      </div>
                      <p>{entry.courseLabel && `${entry.courseLabel} • `}{entry.totalCredits} Credits Total</p>
                      {createdAt && <p className="gpa-history-date">Saved: {createdAt.toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleRemoveEntry(entry.id)} className="delete-action-btn" title="Delete record">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default GpaHistoryPage;
