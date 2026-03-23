import { useEffect, useMemo, useState } from "react";

import {
  createStudentProfile,
  deleteStudentProfile,
  listStudentProfiles,
  updateStudentProfile,
} from "../../services/studentProfileService";
import { extractApiErrorMessage } from "../../utils/error";

const EMPTY_FORM = {
  studentId: "",
  fullName: "",
  semester: "",
  groupNumber: "",
};

const statusLabelMap = {
  pending: "Pending",
  registered: "Registered",
};

const AdminStudentsPage = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ semester: "", groupNumber: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilters = useMemo(() => {
    const parsed = {};

    if (filters.semester) {
      parsed.semester = Number(filters.semester);
    }

    if (filters.groupNumber) {
      parsed.groupNumber = Number(filters.groupNumber);
    }

    return parsed;
  }, [filters]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listStudentProfiles(activeFilters);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [activeFilters.semester, activeFilters.groupNumber]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (record) => {
    setForm({
      studentId: record.studentId || "",
      fullName: record.fullName || "",
      semester: record.semester ? String(record.semester) : "",
      groupNumber: record.groupNumber ? String(record.groupNumber) : "",
    });
    setEditingId(record._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteStudentProfile(id);
      await loadProfiles();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        studentId: form.studentId.trim().toUpperCase(),
        fullName: form.fullName.trim(),
        semester: Number(form.semester),
        groupNumber: Number(form.groupNumber),
      };

      if (editingId) {
        await updateStudentProfile(editingId, payload);
      } else {
        await createStudentProfile(payload);
      }

      resetForm();
      await loadProfiles();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Admin Module</p>
        <h2>Students Management</h2>
        <p>Manage IT Year 3 student profiles by semester and group.</p>
        <p className="admin-scope-note">Scope: IT Faculty • Year 3 • Semester 1/2 • Groups 1/2/3</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
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
        </div>

        <h3 className="admin-subsection-title">Student Profile Form</h3>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            Student ID
            <input
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleInputChange}
              placeholder="IT123456"
              required
            />
          </label>

          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
              placeholder="Student full name"
              required
            />
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

          <div className="admin-form-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Profile" : "Create Profile"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

  <h3 className="admin-subsection-title">Student Profiles</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading student profiles...</p> : null}
          {!loading && records.length === 0 ? <p>No student profiles found.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Semester</th>
                  <th>Group</th>
                  <th>Registration Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.studentId}</td>
                    <td>{record.fullName}</td>
                    <td>{record.semester}</td>
                    <td>{record.groupNumber}</td>
                    <td>
                      <span className={`admin-status-badge is-${record.registrationStatus || "pending"}`}>
                        {statusLabelMap[record.registrationStatus] || "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(record)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ui-btn is-ghost"
                          onClick={() => handleDelete(record._id)}
                        >
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

export default AdminStudentsPage;
