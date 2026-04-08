import { useEffect, useState } from "react";

import { getFullSchedule } from "../../services/lectureScheduleService";
import {
  fileChangeRequest,
  getMyChangeRequests,
} from "../../services/scheduleChangeRequestService";
import { extractApiErrorMessage } from "../../utils/error";

const TIME_SLOTS = [
  { slot: 1, label: "9:00 AM – 11:00 AM" },
  { slot: 2, label: "11:30 AM – 1:30 PM" },
  { slot: 3, label: "2:00 PM – 4:00 PM" },
];

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

const EMPTY_FORM = {
  sessionId: "",
  proposedDate: "",
  proposedSlot: "",
  reason: "",
};

const LecturerChangeRequestsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [scheduleRes, requestsRes] = await Promise.all([
        getFullSchedule(),
        getMyChangeRequests(),
      ]);
      // Only submitted sessions can have change requests
      const submitted = (scheduleRes.data || []).filter((s) => s.status === "submitted");
      setSessions(submitted);
      setRequests(requestsRes.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedSession = sessions.find((s) => s._id === form.sessionId) || null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.sessionId) {
      setError("Please select a session");
      return;
    }
    if (!form.proposedDate) {
      setError("Proposed date is required");
      return;
    }
    if (!form.proposedSlot) {
      setError("Proposed time slot is required");
      return;
    }
    if (!form.reason.trim()) {
      setError("Reason is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await fileChangeRequest({
        sessionId: form.sessionId,
        proposedDate: form.proposedDate,
        proposedSlot: Number(form.proposedSlot),
        reason: form.reason.trim(),
      });

      setSuccess("Change request filed successfully");
      resetForm();
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Schedule Changes</p>
        <h2>Schedule Change Requests</h2>
        <p>File a request to reschedule a submitted lecture session. Admin will review and approve or reject.</p>

        <h3 className="admin-subsection-title">File a Change Request</h3>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label className="admin-form-span-full">
            Select Session to Change
            <select name="sessionId" value={form.sessionId} onChange={handleInputChange} required>
              <option value="">Select a session</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.module?.moduleCode || "?"} — G{s.group} — {formatDate(s.date)} {s.dayOfWeek} Slot {s.slot} ({s.startTime}–{s.endTime}) [{s.type}]
                </option>
              ))}
            </select>
          </label>

          {selectedSession ? (
            <div className="admin-form-span-full" style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.85rem",
              marginBottom: "0.3rem",
            }}>
              <strong>Current:</strong> {selectedSession.module?.moduleName || selectedSession.module?.moduleCode} — Group {selectedSession.group} — {formatDate(selectedSession.date)} {selectedSession.dayOfWeek}, Slot {selectedSession.slot} ({selectedSession.startTime}–{selectedSession.endTime}), {selectedSession.type}
            </div>
          ) : null}

          <label>
            Proposed New Date
            <input
              type="date"
              name="proposedDate"
              value={form.proposedDate}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Proposed Time Slot
            <select name="proposedSlot" value={form.proposedSlot} onChange={handleInputChange} required>
              <option value="">Select Slot</option>
              {TIME_SLOTS.map((ts) => (
                <option key={ts.slot} value={ts.slot}>Slot {ts.slot}: {ts.label}</option>
              ))}
            </select>
          </label>

          <label className="admin-form-span-full">
            Reason
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleInputChange}
              rows={3}
              placeholder="Explain why you need to reschedule this session"
              required
            />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Filing..." : "File Change Request"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        <h3 className="admin-subsection-title">My Requests ({requests.length})</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading...</p> : null}
          {!loading && requests.length === 0 ? <p>No change requests filed yet.</p> : null}

          {!loading && requests.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Group</th>
                  <th>Current</th>
                  <th>Proposed</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const style = STATUS_STYLES[r.status] || {};
                  return (
                    <tr key={r._id}>
                      <td>{r.module?.moduleCode || "-"}</td>
                      <td>G{r.group}</td>
                      <td>{formatDate(r.currentDate)} Slot {r.currentSlot}</td>
                      <td>{formatDate(r.proposedDate)} Slot {r.proposedSlot}</td>
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
                      </td>
                      <td>{r.adminRemarks || "-"}</td>
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

export default LecturerChangeRequestsPage;
