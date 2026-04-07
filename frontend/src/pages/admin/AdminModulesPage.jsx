import { useEffect, useMemo, useState } from "react";

import { listLecturers } from "../../services/adminLecturerService";
import {
  createModule,
  deleteModule,
  listModules,
  updateModule,
} from "../../services/moduleManagementService";
import { extractApiErrorMessage } from "../../utils/error";

const EMPTY_CRITERIA = { title: "", percentage: "" };

const EMPTY_FORM = {
  moduleCode: "",
  moduleName: "",
  semester: "",
  lecturer: "",
  lectureHoursPerWeek: "0",
  tutorialHoursPerWeek: "0",
  labHoursPerWeek: "0",
  outline: "",
  assessmentCriteria: [EMPTY_CRITERIA],
};

// Validation helper functions
const validateModuleCode = (value) => {
  return /^[A-Z0-9]*$/i.test(value) && value.length <= 10;
};

const validateModuleName = (value) => {
  return /^[a-zA-Z\s]*$/.test(value);
};

const AdminModulesPage = () => {
  const [records, setRecords] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilter = useMemo(() => {
    if (!semesterFilter) {
      return {};
    }

    return { semester: Number(semesterFilter) };
  }, [semesterFilter]);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listModules(activeFilter);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [activeFilter.semester]);

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const response = await listLecturers();
        setLecturers(response.data || []);
      } catch {
        // Lecturers list is non-critical, silently handle
      }
    };

    fetchLecturers();
  }, []);

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
      // Module Name: only letters and spaces
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: filteredValue }));
  };

  const handleCriteriaChange = (index, key, value) => {
    setForm((prev) => {
      const nextCriteria = [...prev.assessmentCriteria];
      nextCriteria[index] = {
        ...nextCriteria[index],
        [key]: value,
      };

      return {
        ...prev,
        assessmentCriteria: nextCriteria,
      };
    });
  };

  const addCriteriaRow = () => {
    setForm((prev) => ({
      ...prev,
      assessmentCriteria: [...prev.assessmentCriteria, { ...EMPTY_CRITERIA }],
    }));
  };

  const removeCriteriaRow = (index) => {
    setForm((prev) => {
      const nextCriteria = prev.assessmentCriteria.filter((_, idx) => idx !== index);
      return {
        ...prev,
        assessmentCriteria: nextCriteria.length > 0 ? nextCriteria : [{ ...EMPTY_CRITERIA }],
      };
    });
  };

  const normalizeCriteriaPayload = (criteria = []) => {
    return criteria
      .map((item) => ({
        title: String(item.title || "").trim(),
        percentage: String(item.percentage || "").trim(),
      }))
      .filter((item) => item.title && item.percentage !== "")
      .map((item) => ({
        title: item.title,
        percentage: Number(item.percentage),
      }));
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
      setError("Module Name can only contain letters and spaces");
      return;
    }

    if (!form.semester) {
      setError("Semester is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        moduleCode: form.moduleCode.trim().toUpperCase(),
        moduleName: form.moduleName.trim(),
        semester: Number(form.semester),
        lecturer: form.lecturer || null,
        lectureHoursPerWeek: Number(form.lectureHoursPerWeek || 0),
        tutorialHoursPerWeek: Number(form.tutorialHoursPerWeek || 0),
        labHoursPerWeek: Number(form.labHoursPerWeek || 0),
        outline: form.outline.trim(),
        assessmentCriteria: normalizeCriteriaPayload(form.assessmentCriteria),
      };

      if (editingId) {
        await updateModule(editingId, payload);
      } else {
        await createModule(payload);
      }

      resetForm();
      await loadModules();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setForm({
      moduleCode: record.moduleCode || "",
      moduleName: record.moduleName || "",
      semester: record.semester ? String(record.semester) : "",
      lecturer: record.lecturer?._id || record.lecturer || "",
      lectureHoursPerWeek: String(record.lectureHoursPerWeek ?? 0),
      tutorialHoursPerWeek: String(record.tutorialHoursPerWeek ?? 0),
      labHoursPerWeek: String(record.labHoursPerWeek ?? 0),
      outline: record.outline || "",
      assessmentCriteria:
        Array.isArray(record.assessmentCriteria) && record.assessmentCriteria.length > 0
          ? record.assessmentCriteria.map((item) => ({
              title: item.title || "",
              percentage: String(item.percentage ?? ""),
            }))
          : [{ ...EMPTY_CRITERIA }],
    });

    setEditingId(record._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteModule(id);
      await loadModules();

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
        <h2>Modules Management</h2>
        <p>Manage IT Year 3 modules with weekly hours, outlines, and assessment criteria.</p>
        <p className="admin-scope-note">Scope: IT Faculty • Year 3 • Semester 1/2</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Semester
            <select value={semesterFilter} onChange={(event) => setSemesterFilter(event.target.value)}>
              <option value="">All</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </label>
        </div>

        <h3 className="admin-subsection-title">Module Form</h3>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label>
            Module Code
            <input
              type="text"
              name="moduleCode"
              value={form.moduleCode}
              onChange={handleInputChange}
              placeholder="ITM201"
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
              placeholder="Data Structures"
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
            Assigned Lecturer
            <select name="lecturer" value={form.lecturer} onChange={handleInputChange}>
              <option value="">None</option>
              {lecturers.map((lec) => (
                <option key={lec._id} value={lec._id}>
                  {lec.name} ({lec.email})
                </option>
              ))}
            </select>
          </label>

          <label>
            Lecture Hours / Week
            <input
              type="number"
              min="0"
              name="lectureHoursPerWeek"
              value={form.lectureHoursPerWeek}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Tutorial Hours / Week
            <input
              type="number"
              min="0"
              name="tutorialHoursPerWeek"
              value={form.tutorialHoursPerWeek}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Lab Hours / Week
            <input
              type="number"
              min="0"
              name="labHoursPerWeek"
              value={form.labHoursPerWeek}
              onChange={handleInputChange}
            />
          </label>

          <label className="admin-form-span-full">
            Outline
            <textarea
              name="outline"
              value={form.outline}
              onChange={handleInputChange}
              rows={3}
              placeholder="Module outline and key topics"
            />
          </label>

          <fieldset className="admin-form-span-full admin-criteria-fieldset">
            <legend>Assessment Criteria</legend>
            <p className="admin-criteria-help">Add one or more criteria with title and percentage.</p>

            <div className="admin-criteria-grid">
              {form.assessmentCriteria.map((item, index) => (
                <div className="admin-criteria-row" key={`criteria-${index}`}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) => handleCriteriaChange(index, "title", event.target.value)}
                    placeholder="e.g. Mid Exam"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.percentage}
                    onChange={(event) => handleCriteriaChange(index, "percentage", event.target.value)}
                    placeholder="%"
                  />
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => removeCriteriaRow(index)}
                    aria-label="Remove assessment criterion"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="ghost-btn" onClick={addCriteriaRow}>
              Add Criterion
            </button>
          </fieldset>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Module" : "Create Module"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

  <h3 className="admin-subsection-title">Module Catalog</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading modules...</p> : null}
          {!loading && records.length === 0 ? <p>No modules found.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Module Name</th>
                  <th>Semester</th>
                  <th>Lecturer</th>
                  <th>Hours/Week</th>
                  <th>Assessment Criteria</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.moduleCode}</td>
                    <td>
                      <strong>{record.moduleName}</strong>
                      {record.outline ? <p className="admin-inline-note">{record.outline}</p> : null}
                    </td>
                    <td>{record.semester}</td>
                    <td>{record.lecturer?.name || "-"}</td>
                    <td>
                      L: {record.lectureHoursPerWeek ?? 0} | T: {record.tutorialHoursPerWeek ?? 0} | Lab: {record.labHoursPerWeek ?? 0}
                    </td>
                    <td>
                      {Array.isArray(record.assessmentCriteria) && record.assessmentCriteria.length > 0 ? (
                        <ul className="admin-criteria-list">
                          {record.assessmentCriteria.map((item, index) => (
                            <li key={`${record._id}-criteria-${index}`}>
                              {item.title} ({item.percentage}%)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "-"
                      )}
                    </td>
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

export default AdminModulesPage;
