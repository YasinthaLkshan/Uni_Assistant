import { useEffect, useMemo, useState } from "react";

import {
  createAcademicEntity,
  deleteAcademicEntity,
  listAcademicEntity,
  updateAcademicEntity,
} from "../../services/adminAcademicService";
import { extractApiErrorMessage } from "../../utils/error";

const FILTER_DEFAULTS = {
  semester: "",
  groupNumber: "",
};

const AdminAcademicEntityPage = ({
  entityKey,
  title,
  description,
  columns,
  formFields,
  enableGroupFilter = true,
}) => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [form, setForm] = useState(() =>
    formFields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? "" }), {})
  );
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilters = useMemo(() => {
    const parsed = {};
    if (filters.semester) parsed.semester = Number(filters.semester);
    if (filters.groupNumber) parsed.groupNumber = Number(filters.groupNumber);
    return parsed;
  }, [filters]);

  const resetForm = () => {
    setForm(formFields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? "" }), {}));
    setEditingId("");
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listAcademicEntity(entityKey, activeFilters);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [entityKey, activeFilters.semester, activeFilters.groupNumber]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (record) => {
    const nextForm = formFields.reduce((acc, field) => {
      const value = record[field.name];
      return {
        ...acc,
        [field.name]: field.type === "date" && value ? String(value).slice(0, 10) : value ?? "",
      };
    }, {});

    setForm(nextForm);
    setEditingId(record._id);
  };

  const handleDelete = async (recordId) => {
    try {
      setError("");
      await deleteAcademicEntity(entityKey, recordId);
      await loadRecords();
      if (editingId === recordId) {
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

      if (editingId) {
        await updateAcademicEntity(entityKey, editingId, form);
      } else {
        await createAcademicEntity(entityKey, form);
      }

      resetForm();
      await loadRecords();
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
        <h2>{title}</h2>
        <p>{description}</p>
        <p className="admin-scope-note">Scope: IT Faculty • Year 3 • Semester 1/2 • Groups 1/2/3</p>

        <div className="admin-filter-row">
          <label>
            Semester
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </label>

          {enableGroupFilter ? (
            <label>
              Group
              <select name="groupNumber" value={filters.groupNumber} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="1">Group 1</option>
                <option value="2">Group 2</option>
                <option value="3">Group 3</option>
              </select>
            </label>
          ) : null}
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          {formFields.map((field) => (
            <label key={field.name}>
              {field.label}
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleInputChange}
                  required={field.required}
                >
                  <option value="">Select</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleInputChange}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                />
              )}
            </label>
          ))}

          <div className="admin-form-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading...</p> : null}
          {!loading && records.length === 0 ? <p>No records found.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    {columns.map((column) => {
                      const value = record[column.key];
                      return <td key={`${record._id}-${column.key}`}>{value ?? "-"}</td>;
                    })}
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

export default AdminAcademicEntityPage;
