import { useEffect, useMemo, useState } from "react";

import {
  getAllVivas,
  approveViva,
  rejectViva,
} from "../../services/vivaScheduleService";
import { extractApiErrorMessage } from "../../utils/error";

const VIVA_TYPE_LABELS = {
  documentation_30: "Documentation (30%)",
  progress_80: "Progress (80%)",
  final: "Final Viva",
};

const STATUS_STYLES = {
  proposed: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  approved: { background: "rgba(16,185,129,0.15)", color: "#34d399" },
  rejected: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const AdminVivaReviewPage = () => {
  const [vivas, setVivas] = useState([]);
  const [statusFilter, setStatusFilter] = useState("proposed");
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeFilter = useMemo(() => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    return filters;
  }, [statusFilter]);

  const loadVivas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllVivas(activeFilter);
      setVivas(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVivas();
  }, [activeFilter.status]);

  const handleRemarksChange = (id, value) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  const handleApprove = async (id) => {
    try {
      setProcessing(id);
      setError("");
      setSuccess("");
      await approveViva(id, remarks[id] || "");
      setSuccess("Viva approved");
      setRemarks((prev) => ({ ...prev, [id]: "" }));
      await loadVivas();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setProcessing("");
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(id);
      setError("");
      setSuccess("");
      await rejectViva(id, remarks[id] || "");
      setSuccess("Viva rejected");
      setRemarks((prev) => ({ ...prev, [id]: "" }));
      await loadVivas();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setProcessing("");
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Admin Review</p>
        <h2>Viva Schedule Review</h2>
        <p>Review and approve/reject lecturer-proposed viva sessions.</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="proposed">Proposed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        <h3 className="admin-subsection-title">Vivas ({vivas.length})</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading vivas...</p> : null}
          {!loading && vivas.length === 0 ? <p>No vivas found.</p> : null}

          {!loading && vivas.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Lecturer</th>
                  <th>Module</th>
                  <th>Group</th>
                  <th>Assignment</th>
                  <th>Type</th>
                  <th>Date & Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vivas.map((v) => {
                  const style = STATUS_STYLES[v.status] || {};
                  const isProcessing = processing === v._id;

                  return (
                    <tr key={v._id}>
                      <td>{v.lecturer?.name || "-"}</td>
                      <td>{v.module?.moduleCode || "-"}</td>
                      <td>G{v.group}</td>
                      <td><strong>{v.assignmentTitle}</strong></td>
                      <td>
                        <span style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          background: v.vivaType === "final" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                          color: v.vivaType === "final" ? "#ef4444" : "#60a5fa",
                        }}>
                          {VIVA_TYPE_LABELS[v.vivaType] || v.vivaType}
                        </span>
                      </td>
                      <td>
                        {formatDate(v.date)} ({v.dayOfWeek})<br />
                        Slot {v.slot} ({v.startTime}–{v.endTime})
                      </td>
                      <td>
                        <span style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          ...style,
                        }}>
                          {v.status}
                        </span>
                        {v.adminRemarks ? (
                          <p className="admin-inline-note" style={{ marginTop: "0.3rem" }}>{v.adminRemarks}</p>
                        ) : null}
                      </td>
                      <td>
                        {v.status === "proposed" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: "140px" }}>
                            <textarea
                              value={remarks[v._id] || ""}
                              onChange={(e) => handleRemarksChange(v._id, e.target.value)}
                              placeholder="Remarks (optional)"
                              rows={2}
                              style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                            />
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() => handleApprove(v._id)}
                                disabled={isProcessing}
                                style={{ fontSize: "0.78rem", padding: "0.3rem 0.6rem" }}
                              >
                                {isProcessing ? "..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                className="ui-btn is-ghost"
                                onClick={() => handleReject(v._id)}
                                disabled={isProcessing}
                                style={{ fontSize: "0.78rem", padding: "0.3rem 0.6rem" }}
                              >
                                {isProcessing ? "..." : "Reject"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </div>
      </article>
    </section>
  );
};

export default AdminVivaReviewPage;
