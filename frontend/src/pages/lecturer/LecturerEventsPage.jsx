import { useCallback, useEffect, useMemo, useState } from "react";

import ConfirmModal from "../../components/ConfirmModal";
import {
  getMyModules,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../services/lecturerService";
import { extractApiErrorMessage } from "../../utils/error";

const EVENT_TYPE_OPTIONS = [
  "Assignment",
  "Presentation",
  "Viva",
  "Lab Test",
  "Exam",
  "Spot Test",
  "Seminar",
];

const EMPTY_FORM = {
  semester: "",
  groupNumber: "",
  moduleCode: "",
  moduleName: "",
  title: "",
  eventType: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  weightPercentage: "0",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const todayDate = new Date().toISOString().split("T")[0];

const LecturerEventsPage = () => {
  const [records, setRecords] = useState([]);
  const [modules, setModules] = useState([]);
  const [filters, setFilters] = useState({ moduleCode: "", groupNumber: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await getMyModules();
        setModules(response.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      }
    };

    fetchModules();
  }, []);

  const activeFilters = useMemo(() => {
    const next = {};
    if (filters.moduleCode) next.moduleCode = filters.moduleCode;
    if (filters.groupNumber) next.groupNumber = Number(filters.groupNumber);
    return next;
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyEvents(activeFilters);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeFilters.moduleCode, activeFilters.groupNumber]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleSelect = (event) => {
    const code = event.target.value;
    const mod = modules.find((m) => m.moduleCode === code);
    setError("");
    setForm((prev) => ({
      ...prev,
      moduleCode: code,
      moduleName: mod?.title || "",
    }));
  };

  const validateForm = () => {
    if (!form.semester) return "Please select a semester.";
    if (!form.groupNumber) return "Please select a group.";
    if (!form.moduleCode) return "Please select a module.";
    if (!form.title.trim()) return "Event title is required.";
    if (form.title.trim().length < 3) return "Event title must be at least 3 characters.";
    if (form.title.trim().length > 120) return "Event title must be under 120 characters.";
    if (!form.eventType) return "Please select an event type.";
    if (!form.eventDate) return "Event date is required.";
    const today = new Date().toISOString().split("T")[0];
    if (form.eventDate < today) return "Event date cannot be in the past.";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      return "End time must be after start time.";
    }
    const weight = Number(form.weightPercentage || 0);
    if (weight < 0 || weight > 100) return "Weight percentage must be between 0 and 100.";
    if (form.description.length > 500) return "Description must be under 500 characters.";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        semester: Number(form.semester),
        groupNumber: Number(form.groupNumber),
        moduleCode: form.moduleCode.trim().toUpperCase(),
        moduleName: form.moduleName.trim(),
        title: form.title.trim(),
        eventType: form.eventType,
        description: form.description.trim(),
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue.trim(),
        weightPercentage: Number(form.weightPercentage || 0),
      };

      if (editingId) {
        await updateEvent(editingId, payload);
      } else {
        await createEvent(payload);
      }

      resetForm();
      await loadEvents();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setForm({
      semester: record.semester ? String(record.semester) : "",
      groupNumber: record.groupNumber ? String(record.groupNumber) : "",
      moduleCode: record.moduleCode || "",
      moduleName: record.moduleName || "",
      title: record.title || "",
      eventType: record.eventType || "",
      description: record.description || "",
      eventDate: record.eventDate ? String(record.eventDate).slice(0, 10) : "",
      startTime: record.startTime || "",
      endTime: record.endTime || "",
      venue: record.venue || "",
      weightPercentage: String(record.weightPercentage ?? 0),
    });
    setEditingId(record._id);
  };

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setError("");
      await deleteEvent(deleteTarget);
      await loadEvents();
      if (editingId === deleteTarget) resetForm();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, editingId]);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer Module</p>
        <h2>Academic Events Management</h2>
        <p>Create and manage academic events for your assigned modules.</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Module
            <select name="moduleCode" value={filters.moduleCode} onChange={handleFilterChange}>
              <option value="">All Modules</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod.moduleCode}>
                  {mod.moduleCode} - {mod.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Group
            <select name="groupNumber" value={filters.groupNumber} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </label>
        </div>

        <h3 className="admin-subsection-title">Academic Event Form</h3>

        <form className="admin-form-grid admin-events-form-grid" onSubmit={handleSubmit}>
          <label>
            Module
            <select name="moduleCode" value={form.moduleCode} onChange={handleModuleSelect} required>
              <option value="">Select Module</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod.moduleCode}>
                  {mod.moduleCode} - {mod.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Semester
            <select name="semester" value={form.semester} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </label>

          <label>
            Group Number
            <select name="groupNumber" value={form.groupNumber} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </label>

          <label>
            Title
            <input type="text" name="title" value={form.title} onChange={handleInputChange} required />
          </label>

          <label>
            Event Type
            <select name="eventType" value={form.eventType} onChange={handleInputChange} required>
              <option value="">Select</option>
              {EVENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Event Date
            <input type="date" name="eventDate" value={form.eventDate} onChange={handleInputChange} min={todayDate} required />
          </label>

          <label>
            Start Time
            <input type="time" name="startTime" value={form.startTime} onChange={handleInputChange} />
          </label>

          <label>
            End Time
            <input type="time" name="endTime" value={form.endTime} onChange={handleInputChange} />
          </label>

          <label>
            Venue
            <input type="text" name="venue" value={form.venue} onChange={handleInputChange} />
          </label>

          <label>
            Weight Percentage
            <input
              type="number"
              min="0"
              max="100"
              name="weightPercentage"
              value={form.weightPercentage}
              onChange={handleInputChange}
            />
          </label>

          <label className="admin-form-span-full">
            Description
            <textarea name="description" value={form.description} onChange={handleInputChange} rows={3} />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Event" : "Add Event"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Academic Events</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading events...</p> : null}
          {!loading && records.length === 0 ? <p>No academic events found.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Group</th>
                  <th>Module</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Weight</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.semester}</td>
                    <td>{record.groupNumber}</td>
                    <td>
                      <strong>{record.moduleCode}</strong>
                      <p className="admin-inline-note">{record.moduleName || "-"}</p>
                    </td>
                    <td>
                      <strong>{record.title}</strong>
                      {record.description ? <p className="admin-inline-note">{record.description}</p> : null}
                    </td>
                    <td>{record.eventType}</td>
                    <td>{formatDate(record.eventDate)}</td>
                    <td>
                      {record.startTime || "-"}
                      {record.endTime ? ` - ${record.endTime}` : ""}
                    </td>
                    <td>{record.venue || "-"}</td>
                    <td>{record.weightPercentage ?? 0}%</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(record)}>
                          Edit
                        </button>
                        <button type="button" className="ui-btn is-ghost" onClick={() => setDeleteTarget(record._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </article>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default LecturerEventsPage;
