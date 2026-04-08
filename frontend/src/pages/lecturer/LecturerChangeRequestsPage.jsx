import { useEffect, useState } from "react";

import api from "../../services/api";
import {
  fileChangeRequest,
  getMyChangeRequests,
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

const EMPTY_FORM = {
  timetableEntryId: "",
  proposedDate: "",
  proposedTime: "",
  reason: "",
};

const LecturerChangeRequestsPage = () => {
  const [timetableEntries, setTimetableEntries] = useState([]);
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
      const [timetableRes, requestsRes] = await Promise.all([
        api.get("/lecturer/my-timetable"),
        getMyChangeRequests(),
      ]);
      setTimetableEntries(timetableRes.data.data || []);
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

  const selectedEntry = timetableEntries.find((e) => e._id === form.timetableEntryId) || null;

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

    if (!form.timetableEntryId) {
      setError("Please select a timetable entry");
      return;
    }
    if (!form.proposedDate) {
      setError("Proposed date is required");
      return;
    }
    if (!form.proposedTime) {
      setError("Proposed time is required");
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
        timetableEntryId: form.timetableEntryId,
        proposedDate: form.proposedDate,
        proposedTime: form.proposedTime.trim(),
        reason: form.reason.trim(),
      });

      setSuccess("Change request submitted successfully");
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
        <p className="eyebrow">Timetable Changes</p>
        <h2>Request a Timetable Change</h2>
        <p>Select a timetable entry and propose a new date/time. Admin will review and approve or reject your request.</p>

        <h3 className="admin-subsection-title">Submit a Request</h3>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label className="admin-form-span-full">
            Select Timetable Entry
            <select name="timetableEntryId" value={form.timetableEntryId} onChange={handleInputChange} required>
              <option value="">Select an entry</option>
              {timetableEntries.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.moduleCode} — {e.dayOfWeek} {e.startTime}-{e.endTime} — G{e.groupNumber} — {e.activityType} — {e.venue}
                </option>
              ))}
            </select>
          </label>

          {selectedEntry ? (
            <div className="admin-form-span-full" style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.85rem",
              marginBottom: "0.3rem",
            }}>
              <strong>Current:</strong> {selectedEntry.moduleName || selectedEntry.moduleCode} — {selectedEntry.dayOfWeek}, {selectedEntry.startTime}-{selectedEntry.endTime}, Group {selectedEntry.groupNumber}, {selectedEntry.activityType}, {selectedEntry.venue}
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
            Proposed New Time
            <input
              type="text"
              name="proposedTime"
              value={form.proposedTime}
              onChange={handleInputChange}
              placeholder="e.g. 09:00 - 11:00"
              required
            />
          </label>

          <label className="admin-form-span-full">
            Reason
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleInputChange}
              rows={3}
              placeholder="Explain why you need to change this timetable entry"
              required
            />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Change Request"}
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
          {!loading && requests.length === 0 ? <p>No change requests submitted yet.</p> : null}

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
                      <td>{r.moduleCode || r.module?.moduleCode || "-"}</td>
                      <td>G{r.group}</td>
                      <td>{r.currentDay} {r.currentTime}</td>
                      <td>{formatDate(r.proposedDate)} {r.proposedTime}</td>
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
