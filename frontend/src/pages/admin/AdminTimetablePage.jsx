import { useEffect, useMemo, useState } from "react";

import {
  createTimetableEntry,
  deleteTimetableEntry,
  filterTimetableEntries,
  listTimetableEntries,
  updateTimetableEntry,
} from "../../services/timetableManagementService";
import { extractApiErrorMessage } from "../../utils/error";

const EMPTY_FORM = {
  semester: "",
  groupNumber: "",
  moduleCode: "",
  moduleName: "",
  dayOfWeek: "",
  activityType: "",
  startTime: "",
  endTime: "",
  lecturerNames: "",
  venue: "",
  note: "",
};

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const activityOptions = ["Lecture", "Tutorial", "Lab", "Practical", "Workshop", "Evaluation"];

const parseLecturerNames = (value) => {
  return String(value || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
};

const formatLecturerNames = (lecturerNames = []) => {
  if (!Array.isArray(lecturerNames) || lecturerNames.length === 0) {
    return "-";
  }

  return lecturerNames.join(", ");
};

// Validation helper functions
const validateModuleCode = (value) => {
  return /^[A-Z0-9]*$/i.test(value);
};

const validateModuleName = (value) => {
  return /^[a-zA-Z\s]*$/.test(value);
};

const validateLecturerNames = (value) => {
  return /^[a-zA-Z,\s]*$/.test(value);
};

const validateVenue = (value) => {
  return /^[a-zA-Z0-9\s]*$/.test(value);
};

const AdminTimetablePage = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ semester: "", groupNumber: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const groupedRecords = useMemo(() => {
    const grouped = records.reduce((acc, record) => {
      const groupKey = Number(record.groupNumber) || 0;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      acc[groupKey].push(record);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [records]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const shouldFilter = Boolean(filters.semester) && Boolean(filters.groupNumber);
      const response = shouldFilter
        ? await filterTimetableEntries(Number(filters.semester), Number(filters.groupNumber))
        : await listTimetableEntries();

      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    await loadEntries();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let filteredValue = value;

    // Apply field-specific validation
    if (name === "moduleCode") {
      // Module Code: only alphanumeric
      filteredValue = value.replace(/[^A-Z0-9]/gi, "");
    } else if (name === "moduleName") {
      // Module Name: only letters and spaces
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "lecturerNames") {
      // Lecturer Names: only letters, spaces, and commas
      filteredValue = value.replace(/[^a-zA-Z,\s]/g, "");
    } else if (name === "venue") {
      // Venue: only letters, numbers, and spaces
      filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: filteredValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate field patterns before submission
    if (!validateModuleCode(form.moduleCode)) {
      setError("Module Code can only contain letters and numbers (no symbols allowed)");
      return;
    }

    if (!validateModuleName(form.moduleName)) {
      setError("Module Name can only contain letters and spaces");
      return;
    }

    if (form.lecturerNames && !validateLecturerNames(form.lecturerNames)) {
      setError("Lecturer Names can only contain letters, spaces, and commas");
      return;
    }

    if (!validateVenue(form.venue)) {
      setError("Venue can only contain letters, numbers, and spaces");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      const payload = {
        semester: Number(form.semester),
        groupNumber: Number(form.groupNumber),
        moduleCode: form.moduleCode.trim().toUpperCase(),
        moduleName: form.moduleName.trim(),
        dayOfWeek: form.dayOfWeek,
        activityType: form.activityType,
        startTime: form.startTime,
        endTime: form.endTime,
        lecturerNames: parseLecturerNames(form.lecturerNames),
        venue: form.venue.trim(),
        note: form.note.trim(),
      };

      if (editingId) {
        await updateTimetableEntry(editingId, payload);
        setNotice("Timetable entry updated.");
      } else {
        await createTimetableEntry(payload);
        setNotice("Timetable entry added.");
      }

      resetForm();
      await loadEntries();
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
      dayOfWeek: record.dayOfWeek || "",
      activityType: record.activityType || "",
      startTime: record.startTime || "",
      endTime: record.endTime || "",
      lecturerNames: Array.isArray(record.lecturerNames) ? record.lecturerNames.join(", ") : "",
      venue: record.venue || "",
      note: record.note || "",
    });

    setEditingId(record._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setNotice("");
      await deleteTimetableEntry(id);
      setNotice("Timetable entry deleted.");
      await loadEntries();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <section className="admin-page-grid section-entrance admin-timetable-clean">
      <article className="admin-glass-card admin-module-card admin-timetable-card">
        <p className="eyebrow">Admin Module</p>
        <h2>Timetable Management</h2>
        <p>Plan weekly timetable entries for each semester and group.</p>
        <p className="admin-scope-note">Scope: IT Faculty • Year 3 • Semester 1/2 • Groups 1/2/3</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row admin-filter-row-with-actions">
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

          <div className="admin-filter-actions">
            <button type="button" className="primary-btn" onClick={applyFilters}>
              Apply Filter
            </button>
          </div>
        </div>

        <h3 className="admin-subsection-title">Timetable Entry Form</h3>

        <form className="admin-form-grid admin-timetable-form-grid" onSubmit={handleSubmit}>
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
            <input
              type="text"
              name="moduleCode"
              value={form.moduleCode}
              onChange={handleInputChange}
              placeholder="ITM301"
              required
            />
          </label>

          <label>
            Module Name
            <input
              type="text"
              name="moduleName"
              value={form.moduleName}
              onChange={handleInputChange}
              placeholder="Software Engineering"
              required
            />
          </label>

          <label>
            Day of Week
            <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleInputChange} required>
              <option value="">Select</option>
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <label>
            Activity Type
            <select name="activityType" value={form.activityType} onChange={handleInputChange} required>
              <option value="">Select</option>
              {activityOptions.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </label>

          <label>
            Start Time
            <input type="time" name="startTime" value={form.startTime} onChange={handleInputChange} required />
          </label>

          <label>
            End Time
            <input type="time" name="endTime" value={form.endTime} onChange={handleInputChange} required />
          </label>

          <label>
            Lecturer Names
            <input
              type="text"
              name="lecturerNames"
              value={form.lecturerNames}
              onChange={handleInputChange}
              placeholder="Dr A, Prof B"
            />
          </label>

          <label>
            Venue
            <input type="text" name="venue" value={form.venue} onChange={handleInputChange} placeholder="Lab 3" required />
          </label>

          <label className="admin-form-span-full">
            Note
            <textarea
              name="note"
              value={form.note}
              onChange={handleInputChange}
              rows={2}
              placeholder="Optional notes"
            />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Entry" : "Add Entry"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {notice ? <p className="admin-inline-note admin-action-note">{notice}</p> : null}

  <h3 className="admin-subsection-title">Timetable Entries</h3>

        <div className="admin-data-table-wrap admin-data-table-group-wrap">
          {loading ? <p>Loading timetable...</p> : null}
          {!loading && records.length === 0 ? <p>No timetable entries found.</p> : null}

          {!loading && records.length > 0
            ? groupedRecords.map(([groupNumber, groupRecords]) => (
              <section key={groupNumber} className="admin-group-table-section">
                <h4 className="admin-group-table-title">Group {groupNumber}</h4>

                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Group</th>
                      <th>Module</th>
                      <th>Day</th>
                      <th>Activity</th>
                      <th>Time</th>
                      <th>Lecturers</th>
                      <th>Venue</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRecords.map((record) => (
                      <tr key={record._id}>
                        <td>{record.semester}</td>
                        <td>{record.groupNumber}</td>
                        <td>
                          <strong>{record.moduleCode}</strong>
                          <p className="admin-inline-note">{record.moduleName}</p>
                        </td>
                        <td>{record.dayOfWeek}</td>
                        <td>{record.activityType}</td>
                        <td>
                          {record.startTime} - {record.endTime}
                        </td>
                        <td>{formatLecturerNames(record.lecturerNames)}</td>
                        <td>{record.venue || "-"}</td>
                        <td>{record.note || "-"}</td>
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
              </section>
            ))
            : null}
        </div>
      </article>
    </section>
  );
};

export default AdminTimetablePage;
