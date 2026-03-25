import { useEffect, useMemo, useState } from "react";

import {
  createAcademicEvent,
  deleteAcademicEvent,
  listAcademicEvents,
  updateAcademicEvent,
} from "../../services/academicEventsManagementService";
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

// Validation helper functions
const validateModuleCode = (value) => {
  return /^[A-Z0-9]*$/i.test(value) && value.length <= 10;
};

const validateModuleName = (value) => {
  return /^[a-zA-Z\s]*$/.test(value) && value.length <= 20;
};

const validateTitle = (value) => {
  return /^[a-zA-Z0-9\s]*$/.test(value);
};

const validateWeightPercentage = (value) => {
  return /^\d*$/.test(value);
};

const AdminAcademicEventsPage = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ semester: "", groupNumber: "", moduleCode: "", eventType: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilters = useMemo(() => {
    const next = {};

    if (filters.semester) next.semester = Number(filters.semester);
    if (filters.groupNumber) next.groupNumber = Number(filters.groupNumber);
    if (filters.moduleCode.trim()) next.moduleCode = filters.moduleCode.trim().toUpperCase();
    if (filters.eventType) next.eventType = filters.eventType;

    return next;
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listAcademicEvents(activeFilters);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeFilters.semester, activeFilters.groupNumber, activeFilters.moduleCode, activeFilters.eventType]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ semester: "", groupNumber: "", moduleCode: "", eventType: "" });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let filteredValue = value;

    // Apply field-specific validation
    if (name === "moduleCode") {
      // Module Code: only alphanumeric, max 10 characters
      filteredValue = value.replace(/[^A-Z0-9]/gi, "").slice(0, 10);
    } else if (name === "moduleName") {
      // Module Name: only letters and spaces, max 20 characters
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
    } else if (name === "title") {
      // Title: only letters and numbers
      filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
    } else if (name === "weightPercentage") {
      // Weight Percentage: only numbers, max 100
      filteredValue = value.replace(/[^0-9]/g, "");
      if (filteredValue && Number(filteredValue) > 100) {
        filteredValue = "100";
      }
    }

    setForm((prev) => ({ ...prev, [name]: filteredValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate field patterns before submission
    if (!form.moduleCode.trim()) {
      setError("Module Code is required");
      return;
    }

    if (!validateModuleCode(form.moduleCode)) {
      setError("Module Code can only contain letters and numbers (max 10 characters)");
      return;
    }

    if (!form.moduleName.trim()) {
      setError("Module Name is required");
      return;
    }

    if (!validateModuleName(form.moduleName)) {
      setError("Module Name can only contain letters and spaces (max 20 characters)");
      return;
    }

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!validateTitle(form.title)) {
      setError("Title can only contain letters and numbers");
      return;
    }

    if (form.weightPercentage && !validateWeightPercentage(form.weightPercentage)) {
      setError("Weight Percentage can only contain numbers");
      return;
    }

    const weightValue = Number(form.weightPercentage || 0);
    if (weightValue > 100) {
      setError("Weight Percentage cannot exceed 100");
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
        weightPercentage: weightValue,
      };

      if (editingId) {
        await updateAcademicEvent(editingId, payload);
      } else {
        await createAcademicEvent(payload);
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

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteAcademicEvent(id);
      await loadEvents();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Admin Module</p>
        <h2>Academic Events Management</h2>
        <p>Manage IT Year 3 academic events with strong filtering and clear scheduling details.</p>
        <p className="admin-scope-note">Scope: IT Faculty • Year 3 • Semester 1/2 • Groups 1/2/3</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row admin-filter-grid-events">
          <label>
            Semester
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
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

          <label>
            Module
            <input
              type="text"
              name="moduleCode"
              value={filters.moduleCode}
              onChange={handleFilterChange}
              placeholder="Module code"
            />
          </label>

          <label>
            Event Type
            <select name="eventType" value={filters.eventType} onChange={handleFilterChange}>
              <option value="">All</option>
              {EVENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-filter-actions">
            <button type="button" className="ghost-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <h3 className="admin-subsection-title">Academic Event Form</h3>

        <form className="admin-form-grid admin-events-form-grid" onSubmit={handleSubmit}>
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
            Module Code
            <input type="text" name="moduleCode" value={form.moduleCode} onChange={handleInputChange} required />
          </label>

          <label>
            Module Name
            <input type="text" name="moduleName" value={form.moduleName} onChange={handleInputChange} required />
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
            <input type="date" name="eventDate" value={form.eventDate} onChange={handleInputChange} required />
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
          {loading ? <p>Loading academic events...</p> : null}
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
                        <button type="button" className="ui-btn is-ghost" onClick={() => handleDelete(record._id)}>
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
    </section>
  );
};

export default AdminAcademicEventsPage;
