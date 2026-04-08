import { useEffect, useMemo, useState } from "react";

import { listLecturers } from "../../services/adminLecturerService";
import {
  createModule,
  deleteModule,
  listModules,
  updateModule,
} from "../../services/moduleManagementService";
import { listProgrammes } from "../../services/programmeManagementService";
import { extractApiErrorMessage } from "../../utils/error";

const EMPTY_CRITERIA = { title: "", percentage: "" };

const EMPTY_ASSIGNMENT = { group: "", lecturer: "" };

const EMPTY_FORM = {
  moduleCode: "",
  moduleName: "",
  programme: "",
  academicYear: "",
  semester: "",
  credits: "3",
  lecturer: "",
  lecturerAssignments: [{ ...EMPTY_ASSIGNMENT }],
  lectureHoursPerWeek: "0",
  tutorialHoursPerWeek: "0",
  labHoursPerWeek: "0",
  outline: "",
  assessmentCriteria: [{ ...EMPTY_CRITERIA }],
};

const validateModuleCode = (value) => {
  return /^[A-Z0-9]*$/i.test(value) && value.length <= 10;
};

const validateModuleName = (value) => {
  return /^[a-zA-Z\s]*$/.test(value);
};

const AdminModulesPage = () => {
  const [records, setRecords] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilter = useMemo(() => {
    const filters = {};
    if (semesterFilter) filters.semester = Number(semesterFilter);
    if (programmeFilter) filters.programme = programmeFilter;
    if (yearFilter) filters.academicYear = Number(yearFilter);
    return filters;
  }, [semesterFilter, programmeFilter, yearFilter]);

  const selectedProgramme = useMemo(() => {
    return programmes.find((p) => p._id === form.programme) || null;
  }, [programmes, form.programme]);

  const availableYears = useMemo(() => {
    if (!selectedProgramme) return [1, 2, 3, 4];
    return Array.from({ length: selectedProgramme.duration }, (_, i) => i + 1);
  }, [selectedProgramme]);

  const availableGroups = useMemo(() => {
    if (!selectedProgramme) return [1, 2, 3];
    return selectedProgramme.groups || [1, 2, 3];
  }, [selectedProgramme]);

  const filterProgramme = useMemo(() => {
    return programmes.find((p) => p._id === programmeFilter) || null;
  }, [programmes, programmeFilter]);

  const filterYearOptions = useMemo(() => {
    if (!filterProgramme) return [1, 2, 3, 4];
    return Array.from({ length: filterProgramme.duration }, (_, i) => i + 1);
  }, [filterProgramme]);

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
  }, [activeFilter.semester, activeFilter.programme, activeFilter.academicYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecResponse, progResponse] = await Promise.all([
          listLecturers(),
          listProgrammes(),
        ]);
        setLecturers(lecResponse.data || []);
        setProgrammes(progResponse.data || []);
      } catch {
        // Non-critical
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let filteredValue = value;

    if (name === "moduleCode") {
      filteredValue = value.replace(/[^A-Z0-9]/gi, "").slice(0, 10);
    } else if (name === "moduleName") {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setForm((prev) => {
      const next = { ...prev, [name]: filteredValue };

      if (name === "programme") {
        const prog = programmes.find((p) => p._id === value);
        if (prog) {
          const maxYear = prog.duration;
          if (Number(prev.academicYear) > maxYear) {
            next.academicYear = "";
          }
        }
      }

      return next;
    });
  };

  const handleCriteriaChange = (index, key, value) => {
    setForm((prev) => {
      const nextCriteria = [...prev.assessmentCriteria];
      nextCriteria[index] = { ...nextCriteria[index], [key]: value };
      return { ...prev, assessmentCriteria: nextCriteria };
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

  const handleAssignmentChange = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.lecturerAssignments];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, lecturerAssignments: next };
    });
  };

  const addAssignmentRow = () => {
    setForm((prev) => ({
      ...prev,
      lecturerAssignments: [...prev.lecturerAssignments, { ...EMPTY_ASSIGNMENT }],
    }));
  };

  const removeAssignmentRow = (index) => {
    setForm((prev) => {
      const next = prev.lecturerAssignments.filter((_, idx) => idx !== index);
      return {
        ...prev,
        lecturerAssignments: next.length > 0 ? next : [{ ...EMPTY_ASSIGNMENT }],
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

  const normalizeAssignmentsPayload = (assignments = []) => {
    return assignments
      .filter((item) => item.group && item.lecturer)
      .map((item) => ({
        group: Number(item.group),
        lecturer: item.lecturer,
      }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        credits: Number(form.credits || 3),
        lecturer: form.lecturer || null,
        lectureHoursPerWeek: Number(form.lectureHoursPerWeek || 0),
        tutorialHoursPerWeek: Number(form.tutorialHoursPerWeek || 0),
        labHoursPerWeek: Number(form.labHoursPerWeek || 0),
        outline: form.outline.trim(),
        assessmentCriteria: normalizeCriteriaPayload(form.assessmentCriteria),
        lecturerAssignments: normalizeAssignmentsPayload(form.lecturerAssignments),
      };

      if (form.programme) {
        payload.programme = form.programme;
      }

      if (form.academicYear) {
        payload.academicYear = Number(form.academicYear);
      }

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
      programme: record.programme?._id || record.programme || "",
      academicYear: record.academicYear ? String(record.academicYear) : "",
      semester: record.semester ? String(record.semester) : "",
      credits: String(record.credits ?? 3),
      lecturer: record.lecturer?._id || record.lecturer || "",
      lecturerAssignments:
        Array.isArray(record.lecturerAssignments) && record.lecturerAssignments.length > 0
          ? record.lecturerAssignments.map((a) => ({
              group: String(a.group || ""),
              lecturer: a.lecturer?._id || a.lecturer || "",
            }))
          : [{ ...EMPTY_ASSIGNMENT }],
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
    <section className="admin-page-grid section-entrance admin-modules-clean">
      <article className="admin-glass-card admin-module-card admin-modules-card">
        <p className="eyebrow">Admin Module</p>
        <h2>Modules Management</h2>
        <p>Manage modules with programme assignment, credits, hours, and per-group lecturer assignment.</p>
        <p className="admin-scope-note">Scope: IT Faculty</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Programme
            <select value={programmeFilter} onChange={(event) => { setProgrammeFilter(event.target.value); setYearFilter(""); }}>
              <option value="">All Programmes</option>
              {programmes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.programmeCode} - {p.programmeName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Year
            <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              <option value="">All Years</option>
              {filterYearOptions.map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </label>

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
            Programme
            <select name="programme" value={form.programme} onChange={handleInputChange}>
              <option value="">Select Programme</option>
              {programmes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.programmeCode} - {p.programmeName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Year
            <select name="academicYear" value={form.academicYear} onChange={handleInputChange}>
              <option value="">Select Year</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>Year {y}</option>
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
            Credits
            <input
              type="number"
              min="1"
              max="10"
              name="credits"
              value={form.credits}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Default Lecturer
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
            <legend>Lecturer Assignments per Group</legend>
            <p className="admin-criteria-help">Assign a lecturer to each group for this module.</p>

            <div className="admin-criteria-grid">
              {form.lecturerAssignments.map((item, index) => (
                <div className="admin-criteria-row" key={`assign-${index}`}>
                  <select
                    value={item.group}
                    onChange={(event) => handleAssignmentChange(index, "group", event.target.value)}
                  >
                    <option value="">Group</option>
                    {availableGroups.map((g) => (
                      <option key={g} value={g}>Group {g}</option>
                    ))}
                  </select>
                  <select
                    value={item.lecturer}
                    onChange={(event) => handleAssignmentChange(index, "lecturer", event.target.value)}
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map((lec) => (
                      <option key={lec._id} value={lec._id}>
                        {lec.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => removeAssignmentRow(index)}
                    aria-label="Remove lecturer assignment"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="ghost-btn" onClick={addAssignmentRow}>
              Add Assignment
            </button>
          </fieldset>

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
                  <th>Programme</th>
                  <th>Year / Sem</th>
                  <th>Credits</th>
                  <th>Lecturer(s)</th>
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
                    <td>
                      {record.programme
                        ? `${record.programme.programmeCode} (${record.programme.programmeType})`
                        : "-"}
                    </td>
                    <td>
                      Y{record.academicYear} / S{record.semester}
                    </td>
                    <td>{record.credits ?? 3}</td>
                    <td>
                      {Array.isArray(record.lecturerAssignments) && record.lecturerAssignments.length > 0 ? (
                        <ul className="admin-criteria-list">
                          {record.lecturerAssignments.map((a, i) => (
                            <li key={`${record._id}-assign-${i}`}>
                              G{a.group}: {a.lecturer?.name || "-"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        record.lecturer?.name || "-"
                      )}
                    </td>
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
