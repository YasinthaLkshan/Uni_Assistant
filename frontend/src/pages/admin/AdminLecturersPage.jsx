import { useEffect, useState } from "react";

import {
  listLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer,
} from "../../services/adminLecturerService";
import { extractApiErrorMessage } from "../../utils/error";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  department: "",
};

const AdminLecturersPage = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadLecturers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listLecturers();
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLecturers();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (record) => {
    setForm({
      name: record.name || "",
      email: record.email || "",
      password: "",
      department: record.department || "",
    });
    setEditingId(record._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteLecturer(id);
      await loadLecturers();
      if (editingId === id) resetForm();
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
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim(),
      };

      if (editingId) {
        if (form.password) {
          payload.password = form.password;
        }
        await updateLecturer(editingId, payload);
      } else {
        payload.password = form.password;
        await createLecturer(payload);
      }

      resetForm();
      await loadLecturers();
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
        <h2>Lecturers Management</h2>
        <p>Create and manage lecturer accounts.</p>

        <h3 className="admin-subsection-title">Lecturer Form</h3>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Lecturer full name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="lecturer@university.edu"
              required
            />
          </label>

          <label>
            Password{editingId ? " (leave blank to keep current)" : ""}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder={editingId ? "Leave blank to keep current" : "Minimum 6 characters"}
              minLength={editingId ? 0 : 6}
              required={!editingId}
            />
          </label>

          <label>
            Department
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleInputChange}
              placeholder="e.g. Computer Science"
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Lecturer" : "Create Lecturer"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Lecturers</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading lecturers...</p> : null}
          {!loading && records.length === 0 ? <p>No lecturers found.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.name}</td>
                    <td>{record.email}</td>
                    <td>{record.department || "-"}</td>
                    <td>{new Date(record.createdAt).toLocaleDateString()}</td>
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

export default AdminLecturersPage;
