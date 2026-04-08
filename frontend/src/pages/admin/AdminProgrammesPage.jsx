import { useEffect, useMemo, useState } from "react";

import {
  createProgramme,
  deleteProgramme,
  listProgrammes,
  updateProgramme,
} from "../../services/programmeManagementService";
import { extractApiErrorMessage } from "../../utils/error";

const PROGRAMME_TYPES = ["BSc", "HND", "Diploma", "Certificate"];

const EMPTY_FORM = {
  programmeCode: "",
  programmeName: "",
  programmeType: "",
  duration: "1",
  groups: "1, 2, 3",
  description: "",
  isActive: true,
};

const validateProgrammeCode = (value) => {
  return /^[A-Z0-9-]*$/i.test(value) && value.length <= 20;
};

const AdminProgrammesPage = () => {
  const [records, setRecords] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilter = useMemo(() => {
    if (!typeFilter) return {};
    return { programmeType: typeFilter };
  }, [typeFilter]);

  const loadProgrammes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listProgrammes(activeFilter);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, [activeFilter.programmeType]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    let filteredValue = type === "checkbox" ? checked : value;

    if (name === "programmeCode") {
      filteredValue = value.replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
    }

    setForm((prev) => ({ ...prev, [name]: filteredValue }));
  };

  const parseGroups = (groupsStr) => {
    return groupsStr
      .split(",")
      .map((g) => Number(g.trim()))
      .filter((g) => Number.isInteger(g) && g >= 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.programmeCode.trim()) {
      setError("Programme Code is required");
      return;
    }

    if (!validateProgrammeCode(form.programmeCode)) {
      setError("Programme Code can only contain letters, numbers, and hyphens (max 20 characters)");
      return;
    }

    if (!form.programmeName.trim()) {
      setError("Programme Name is required");
      return;
    }

    if (!form.programmeType) {
      setError("Programme Type is required");
      return;
    }

    const groups = parseGroups(form.groups);
    if (groups.length === 0) {
      setError("At least one valid group number is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        programmeCode: form.programmeCode.trim().toUpperCase(),
        programmeName: form.programmeName.trim(),
        programmeType: form.programmeType,
        duration: Number(form.duration),
        groups,
        description: form.description.trim(),
        isActive: form.isActive,
      };

      if (editingId) {
        await updateProgramme(editingId, payload);
      } else {
        await createProgramme(payload);
      }

      resetForm();
      await loadProgrammes();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setForm({
      programmeCode: record.programmeCode || "",
      programmeName: record.programmeName || "",
      programmeType: record.programmeType || "",
      duration: String(record.duration ?? 1),
      groups: Array.isArray(record.groups) ? record.groups.join(", ") : "1, 2, 3",
      description: record.description || "",
      isActive: record.isActive !== false,
    });

    setEditingId(record._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteProgramme(id);
      await loadProgrammes();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const getSemesterBreakdown = (duration) => {
    const years = [];
    for (let y = 1; y <= duration; y++) {
      years.push(`Year ${y} (Sem 1 & 2)`);
    }
    return years.join(" → ");
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Admin Programme</p>
        <h2>Programmes Management</h2>
        <p>Create and manage academic programmes — BSc, HND, Diploma, Certificate courses.</p>
        <p className="admin-scope-note">Scope: IT Faculty</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Programme Type
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">All</option>
              {PROGRAMME_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h3 className="admin-subsection-title">Programme Form</h3>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label>
            Programme Code
            <input
              type="text"
              name="programmeCode"
              value={form.programmeCode}
              onChange={handleInputChange}
              placeholder="BSC-IT"
              required
            />
          </label>

          <label>
            Programme Name
            <input
              type="text"
              name="programmeName"
              value={form.programmeName}
              onChange={handleInputChange}
              placeholder="BSc in Information Technology"
              required
            />
          </label>

          <label>
            Programme Type
            <select name="programmeType" value={form.programmeType} onChange={handleInputChange} required>
              <option value="">Select</option>
              {PROGRAMME_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Duration (Years)
            <select name="duration" value={form.duration} onChange={handleInputChange} required>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years</option>
            </select>
          </label>

          <label>
            Groups
            <input
              type="text"
              name="groups"
              value={form.groups}
              onChange={handleInputChange}
              placeholder="1, 2, 3"
            />
          </label>

          <label>
            Active
            <select
              name="isActive"
              value={form.isActive ? "true" : "false"}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.value === "true" }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>

          <label className="admin-form-span-full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Programme description and objectives"
            />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Programme" : "Create Programme"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Programme Catalog</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading programmes...</p> : null}
          {!loading && records.length === 0 ? <p>No programmes found.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Programme Name</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Structure</th>
                  <th>Groups</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.programmeCode}</td>
                    <td>
                      <strong>{record.programmeName}</strong>
                      {record.description ? (
                        <p className="admin-inline-note">{record.description}</p>
                      ) : null}
                    </td>
                    <td>{record.programmeType}</td>
                    <td>{record.duration} {record.duration === 1 ? "Year" : "Years"}</td>
                    <td>
                      <p className="admin-inline-note">
                        {getSemesterBreakdown(record.duration)}
                      </p>
                    </td>
                    <td>{Array.isArray(record.groups) ? record.groups.join(", ") : "-"}</td>
                    <td>{record.isActive ? "Active" : "Inactive"}</td>
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

export default AdminProgrammesPage;
