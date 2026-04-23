import { useEffect, useMemo, useState } from "react";

import {
  getAllChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
} from "../../services/scheduleChangeRequestService";
import { extractApiErrorMessage } from "../../utils/error";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STATUS_STYLES = {
  pending: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  approved: { background: "rgba(16,185,129,0.15)", color: "#34d399" },
  rejected: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
};

const AdminChangeRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
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

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllChangeRequests(activeFilter);
      setRequests(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeFilter.status]);

  const handleRemarksChange = (requestId, value) => {
    setRemarks((prev) => ({ ...prev, [requestId]: value }));
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(requestId);
      setError("");
      setSuccess("");
      await approveChangeRequest(requestId, remarks[requestId] || "");
      setSuccess("Request approved — schedule updated");
      setRemarks((prev) => ({ ...prev, [requestId]: "" }));
      await loadRequests();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setProcessing("");
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessing(requestId);
      setError("");
      setSuccess("");
      await rejectChangeRequest(requestId, remarks[requestId] || "");
      setSuccess("Request rejected");
      setRemarks((prev) => ({ ...prev, [requestId]: "" }));
      await loadRequests();
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
        <h2>Schedule Change Requests</h2>
        <p>Review and process lecturer requests to reschedule submitted sessions.</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        <h3 className="admin-subsection-title">Requests ({requests.length})</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading requests...</p> : null}
          {!loading && requests.length === 0 ? <p>No change requests found.</p> : null}

          {!loading && requests.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Lecturer</th>
                  <th>Module</th>
                  <th>Group</th>
                  <th>Current</th>
                  <th>Proposed</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const style = STATUS_STYLES[r.status] || {};
                  const isProcessing = processing === r._id;

                  return (
                    <tr key={r._id}>
                      <td>{r.lecturer?.name || "-"}</td>
                      <td>{r.module?.moduleCode || "-"}</td>
                      <td>G{r.group}</td>
                      <td>
                        {formatDate(r.currentDate)}<br />
                        Slot {r.currentSlot} ({r.currentType})
                      </td>
                      <td>
                        {formatDate(r.proposedDate)}<br />
                        Slot {r.proposedSlot}
                      </td>
                      <td><p className="admin-inline-note">{r.reason}</p></td>
                      <td>
                        <span style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          ...style,
                        }}>
                          {r.status}
                        </span>
                        {r.adminRemarks ? (
                          <p className="admin-inline-note" style={{ marginTop: "0.3rem" }}>
                            {r.adminRemarks}
                          </p>
                        ) : null}
                      </td>
                      <td>
                        {r.status === "pending" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: "140px" }}>
                            <textarea
                              value={remarks[r._id] || ""}
                              onChange={(e) => handleRemarksChange(r._id, e.target.value)}
                              placeholder="Remarks (optional)"
                              rows={2}
                              style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                            />
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() => handleApprove(r._id)}
                                disabled={isProcessing}
                                style={{ fontSize: "0.78rem", padding: "0.3rem 0.6rem" }}
                              >
                                {isProcessing ? "..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                className="ui-btn is-ghost"
                                onClick={() => handleReject(r._id)}
                                disabled={isProcessing}
                                style={{ fontSize: "0.78rem", padding: "0.3rem 0.6rem" }}
                              >
                                {isProcessing ? "..." : "Reject"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>
                            {r.reviewedBy?.name ? `by ${r.reviewedBy.name}` : "Reviewed"}
                          </span>
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

export default AdminChangeRequestsPage;
