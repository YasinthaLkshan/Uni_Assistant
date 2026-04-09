import { useState, useEffect, useCallback, useRef } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getMyModules,
  getExamPapers,
  createExamPaper,
  updateExamPaper,
  deleteExamPaper,
} from "../../services/lecturerService";

const EXAM_TYPES = ["Mid-Semester", "End-Semester", "Supplementary"];

const EMPTY_FORM = {
  moduleCode: "",
  examTitle: "",
  examType: "",
  examDate: "",
  duration: "",
  totalMarks: "",
  semester: "",
  groups: [],
};

const STATUS_CLASSES = {
  Pending: "is-pending",
  Approved: "is-registered",
  Rejected: "is-rejected",
};

const todayDate = new Date().toISOString().split("T")[0];

const LecturerExamSubmissionPage = () => {
  const [modules, setModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modRes, examRes] = await Promise.all([getMyModules(), getExamPapers()]);
        setModules(modRes.data || []);
        setRecords(examRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupToggle = (groupNum) => {
    setForm((prev) => {
      const groups = prev.groups.includes(groupNum)
        ? prev.groups.filter((g) => g !== groupNum)
        : [...prev.groups, groupNum];
      return { ...prev, groups };
    });
  };

  const validateForm = () => {
    if (!form.moduleCode) return "Please select a module.";
    if (!form.examTitle.trim()) return "Exam title is required.";
    if (form.examTitle.trim().length < 3) return "Exam title must be at least 3 characters.";
    if (form.examTitle.trim().length > 120) return "Exam title must be under 120 characters.";
    if (!form.examType) return "Please select an exam type.";
    if (!form.examDate) return "Exam date is required.";
    const today = new Date().toISOString().split("T")[0];
    if (form.examDate < today) return "Exam date cannot be in the past.";
    if (form.duration && Number(form.duration) <= 0) return "Duration must be a positive number.";
    const marks = Number(form.totalMarks || 0);
    if (marks < 0 || marks > 100) return "Total marks must be between 0 and 100.";
    if (!form.semester) return "Please select a semester.";
    if (form.groups.length === 0) return "Please select at least one group.";
    const file = fileRef.current?.files?.[0];
    if (file && file.size > 10 * 1024 * 1024) return "File size must be under 10 MB.";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("moduleCode", form.moduleCode);
      formData.append("examTitle", form.examTitle);
      formData.append("examType", form.examType);
      formData.append("examDate", form.examDate);
      formData.append("duration", form.duration);
      formData.append("totalMarks", form.totalMarks);
      formData.append("semester", form.semester);
      formData.append("groups", JSON.stringify(form.groups));

      const file = fileRef.current?.files?.[0];
      if (file) formData.append("file", file);

      if (editingId) {
        const res = await updateExamPaper(editingId, formData);
        setRecords((prev) => prev.map((r) => (r._id === editingId ? res.data : r)));
      } else {
        const res = await createExamPaper(formData);
        setRecords((prev) => [res.data, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    if (record.status !== "Pending") return;

    setForm({
      moduleCode: record.moduleCode,
      examTitle: record.examTitle,
      examType: record.examType,
      examDate: record.examDate ? record.examDate.slice(0, 10) : "",
      duration: record.duration || "",
      totalMarks: String(record.totalMarks || ""),
      semester: String(record.semester),
      groups: record.groups || [],
    });
    setEditingId(record._id);
    if (fileRef.current) fileRef.current.value = "";
  };

  const requestDelete = (id) => {
    const record = records.find((r) => r._id === id);
    if (record?.status !== "Pending") return;
    setDeleteTarget(id);
  };

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteExamPaper(deleteTarget);
      setRecords((prev) => prev.filter((r) => r._id !== deleteTarget));
      if (editingId === deleteTarget) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, editingId]);

  if (loading) return <p>Loading...</p>;

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer Module</p>
        <h2>Exam Paper Submission</h2>
        <p>Submit exam papers for admin review and approval before scheduling.</p>

        <h3 className="admin-subsection-title">Submit Exam Paper</h3>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            Module
            <select name="moduleCode" value={form.moduleCode} onChange={handleInputChange} required>
              <option value="">Select Module</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod.moduleCode}>
                  {mod.moduleCode} - {mod.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Exam Title
            <input
              type="text"
              name="examTitle"
              value={form.examTitle}
              onChange={handleInputChange}
              placeholder="e.g. Mid-Semester Examination"
              required
            />
          </label>

          <label>
            Exam Type
            <select name="examType" value={form.examType} onChange={handleInputChange} required>
              <option value="">Select Type</option>
              {EXAM_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Exam Date
            <input type="date" name="examDate" value={form.examDate} onChange={handleInputChange} min={todayDate} required />
          </label>

          <label>
            Duration
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleInputChange}
              placeholder="e.g. 2 hours"
            />
          </label>

          <label>
            Total Marks
            <input
              type="number"
              name="totalMarks"
              min="0"
              max="100"
              value={form.totalMarks}
              onChange={handleInputChange}
              placeholder="e.g. 50"
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

          <fieldset>
            <legend>Groups</legend>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              {[1, 2, 3].map((g) => (
                <label key={g} style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.groups.includes(g)}
                    onChange={() => handleGroupToggle(g)}
                  />
                  Group {g}
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Exam Paper File
            <input type="file" ref={fileRef} accept=".pdf,.doc,.docx" />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Submitting..." : editingId ? "Update Submission" : "Submit Exam Paper"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Submitted Exam Papers</h3>

        <div className="admin-data-table-wrap">
          {records.length === 0 ? <p>No exam papers submitted yet.</p> : null}

          {records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Exam Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Marks</th>
                  <th>Groups</th>
                  <th>File</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <strong>{record.moduleCode}</strong>
                      <p className="admin-inline-note">{record.moduleName}</p>
                    </td>
                    <td>{record.examTitle}</td>
                    <td>{record.examType}</td>
                    <td>{record.examDate ? new Date(record.examDate).toLocaleDateString() : "-"}</td>
                    <td>{record.duration || "-"}</td>
                    <td>{record.totalMarks}</td>
                    <td>{record.groups?.join(", ")}</td>
                    <td>{record.fileName}</td>
                    <td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-"}</td>
                    <td>
                      <span className={`admin-status-badge ${STATUS_CLASSES[record.status] || ""}`}>
                        {record.status}
                      </span>
                      {record.adminRemarks ? (
                        <p className="admin-inline-note" style={{ color: "#e74c3c", marginTop: "0.25rem" }}>
                          {record.adminRemarks}
                        </p>
                      ) : null}
                    </td>
                    <td>
                      {record.status === "Pending" ? (
                        <div className="admin-row-actions">
                          <button type="button" className="ghost-btn" onClick={() => handleEdit(record)}>
                            Edit
                          </button>
                          <button type="button" className="ui-btn is-ghost" onClick={() => requestDelete(record._id)}>
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#999", fontSize: "0.85rem" }}>-</span>
                      )}
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
        title="Delete Exam Paper"
        message="Are you sure you want to delete this exam paper? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default LecturerExamSubmissionPage;
