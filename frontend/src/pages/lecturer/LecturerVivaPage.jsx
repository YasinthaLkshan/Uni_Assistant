import { useEffect, useMemo, useState } from "react";

import { getMyModules } from "../../services/lecturerService";
import {
  proposeViva,
  getMyVivas,
  deleteViva,
} from "../../services/vivaScheduleService";
import { extractApiErrorMessage } from "../../utils/error";

const TIME_SLOTS = [
  { slot: 1, label: "9:00 AM – 11:00 AM" },
  { slot: 2, label: "11:30 AM – 1:30 PM" },
  { slot: 3, label: "2:00 PM – 4:00 PM" },
];

const VIVA_TYPES = [
  { value: "documentation_30", label: "Documentation Check (30%)" },
  { value: "progress_80", label: "Progress Check (80%)" },
  { value: "final", label: "Final Viva" },
];

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

const EMPTY_FORM = {
  moduleId: "",
  group: "",
  assignmentTitle: "",
  vivaType: "",
  date: "",
  slot: "",
};

const LecturerVivaPage = () => {
  const [modules, setModules] = useState([]);
  const [vivas, setVivas] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedModule = useMemo(() => {
    return modules.find((m) => m._id === form.moduleId) || null;
  }, [modules, form.moduleId]);

  const availableGroups = useMemo(() => {
    if (!selectedModule) return [];
    return selectedModule.assignedGroups || selectedModule.groups || [1, 2, 3];
  }, [selectedModule]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modRes, vivaRes] = await Promise.all([
        getMyModules(),
        getMyVivas(),
      ]);
      setModules(modRes.data || []);
      setVivas(vivaRes.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

    if (!form.moduleId || !form.group || !form.assignmentTitle.trim() || !form.vivaType || !form.date || !form.slot) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await proposeViva({
        moduleId: form.moduleId,
        group: Number(form.group),
        assignmentTitle: form.assignmentTitle.trim(),
        vivaType: form.vivaType,
        date: form.date,
        slot: Number(form.slot),
      });

      setSuccess("Viva proposed successfully — awaiting admin approval");
      resetForm();
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setSuccess("");
      await deleteViva(id);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Viva Scheduling</p>
        <h2>Group Assignment Vivas</h2>
        <p>
          Propose viva dates for group assignments. Each assignment has 3 vivas: Documentation (30%), Progress (80%), and Final.
          Final viva days cannot have any lectures for the batch.
        </p>

        <h3 className="admin-subsection-title">Propose a Viva</h3>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label>
            Module
            <select name="moduleId" value={form.moduleId} onChange={handleInputChange} required>
              <option value="">Select Module</option>
              {modules.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.moduleCode} - {m.title || m.moduleName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Group
            <select name="group" value={form.group} onChange={handleInputChange} required disabled={!form.moduleId}>
              <option value="">Select Group</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>Group {g}</option>
              ))}
            </select>
          </label>

          <label>
            Assignment Title
            <input
              type="text"
              name="assignmentTitle"
              value={form.assignmentTitle}
              onChange={handleInputChange}
              placeholder="e.g. Group Project Phase 1"
              required
            />
          </label>

          <label>
            Viva Type
            <select name="vivaType" value={form.vivaType} onChange={handleInputChange} required>
              <option value="">Select Type</option>
              {VIVA_TYPES.map((vt) => (
                <option key={vt.value} value={vt.value}>{vt.label}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Time Slot
            <select name="slot" value={form.slot} onChange={handleInputChange} required>
              <option value="">Select Slot</option>
              {TIME_SLOTS.map((ts) => (
                <option key={ts.slot} value={ts.slot}>Slot {ts.slot}: {ts.label}</option>
              ))}
            </select>
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Proposing..." : "Propose Viva"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        <h3 className="admin-subsection-title">My Vivas ({vivas.length})</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading...</p> : null}
          {!loading && vivas.length === 0 ? <p>No vivas proposed yet.</p> : null}

          {!loading && vivas.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Group</th>
                  <th>Assignment</th>
                  <th>Viva Type</th>
                  <th>Date</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vivas.map((v) => {
                  const style = STATUS_STYLES[v.status] || {};
                  const typeLabel = VIVA_TYPES.find((t) => t.value === v.vivaType)?.label || v.vivaType;
                  return (
                    <tr key={v._id}>
                      <td>{v.module?.moduleCode || "-"}</td>
                      <td>G{v.group}</td>
                      <td><strong>{v.assignmentTitle}</strong></td>
                      <td>{typeLabel}</td>
                      <td>{formatDate(v.date)} ({v.dayOfWeek})</td>
                      <td>Slot {v.slot} ({v.startTime}–{v.endTime})</td>
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
                          <p className="admin-inline-note" style={{ marginTop: "0.2rem" }}>{v.adminRemarks}</p>
                        ) : null}
                      </td>
                      <td>
                        {v.status !== "approved" ? (
                          <button type="button" className="ui-btn is-ghost" onClick={() => handleDelete(v._id)}>
                            Delete
                          </button>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>Locked</span>
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

export default LecturerVivaPage;
