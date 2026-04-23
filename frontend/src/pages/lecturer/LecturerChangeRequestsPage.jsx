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

const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayYMD = () => toYMD(new Date());

const tomorrowYMD = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toYMD(d);
};

const maxDateYMD = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return toYMD(d);
};

const TIME_RANGE_RE = /^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/;

const DAY_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const REASON_MIN = 10;
const REASON_MAX = 1000;

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
    const minDate = tomorrowYMD();
    const maxDate = maxDateYMD();
    if (form.proposedDate < minDate) {
      setError("Proposed date must be tomorrow or later (admin needs time to review)");
      return;
    }
    if (form.proposedDate > maxDate) {
      setError("Proposed date cannot be more than 6 months from today");
      return;
    }
    const proposedDayName = DAY_OF_WEEK[new Date(`${form.proposedDate}T00:00:00`).getDay()];
    if (selectedEntry && proposedDayName === selectedEntry.dayOfWeek) {
      setError(`Proposed date falls on ${proposedDayName}, the same day as the current slot — choose a different date`);
      return;
    }

    const timeText = form.proposedTime.trim();
    if (!timeText) {
      setError("Proposed time is required");
      return;
    }
    const match = timeText.match(TIME_RANGE_RE);
    if (!match) {
      setError("Proposed time must be in format HH:MM - HH:MM (e.g. 09:00 - 11:00)");
      return;
    }
    const [, sh, sm, eh, em] = match;
    const startMinutes = Number(sh) * 60 + Number(sm);
    const endMinutes = Number(eh) * 60 + Number(em);
    if (endMinutes <= startMinutes) {
      setError("End time must be after start time");
      return;
    }
    if (endMinutes - startMinutes < 30) {
      setError("Session must be at least 30 minutes long");
      return;
    }
    if (startMinutes < 7 * 60 || endMinutes > 21 * 60) {
      setError("Time must be between 07:00 and 21:00");
      return;
    }

    const reason = form.reason.trim();
    if (!reason) {
      setError("Reason is required");
      return;
    }
    if (reason.length < REASON_MIN) {
      setError(`Reason must be at least ${REASON_MIN} characters (currently ${reason.length})`);
      return;
    }
    if (reason.length > REASON_MAX) {
      setError(`Reason must be at most ${REASON_MAX} characters`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await fileChangeRequest({
        timetableEntryId: form.timetableEntryId,
        proposedDate: form.proposedDate,
        proposedTime: timeText,
        reason,
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
              min={tomorrowYMD()}
              max={maxDateYMD()}
              required
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              Earliest: tomorrow · Latest: 6 months out
            </small>
          </label>

          <label>
            Proposed New Time
            <input
              type="text"
              name="proposedTime"
              value={form.proposedTime}
              onChange={handleInputChange}
              placeholder="09:00 - 11:00"
              pattern="^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$"
              title="Format HH:MM - HH:MM between 07:00 and 21:00"
              required
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              24h format, between 07:00 and 21:00, minimum 30 minutes
            </small>
          </label>

          <label className="admin-form-span-full">
            Reason
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleInputChange}
              rows={3}
              minLength={REASON_MIN}
              maxLength={REASON_MAX}
              placeholder="Explain why you need to change this timetable entry (minimum 10 characters)"
              required
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              {form.reason.trim().length} / {REASON_MAX} characters
              {form.reason.trim().length > 0 && form.reason.trim().length < REASON_MIN
                ? ` — need ${REASON_MIN - form.reason.trim().length} more`
                : ""}
            </small>
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
