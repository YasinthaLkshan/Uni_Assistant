import { useState, useEffect, useCallback, useRef } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getMyModules,
  getCoursework,
  createCourseworkItem,
  updateCourseworkItem,
  deleteCourseworkItem,
} from "../../services/lecturerService";

const COURSEWORK_TYPES = ["Assignment", "Lab Report", "Project", "Quiz"];

const EMPTY_FORM = {
  moduleCode: "",
  courseworkTitle: "",
  courseworkType: "",
  description: "",
  deadline: "",
  weightPercentage: "",
  semester: "",
  groupNumber: "",
};

const STATUS_CLASSES = {
  Pending: "is-pending",
  Approved: "is-registered",
  Rejected: "is-rejected",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const todayDate = new Date().toISOString().split("T")[0];

const LecturerCourseworkUploadPage = () => {
  const [modules, setModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modRes, cwRes] = await Promise.all([getMyModules(), getCoursework()]);
        setModules(modRes.data || []);
        setRecords(cwRes.data || []);
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
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.moduleCode) return "Please select a module.";
    if (!form.courseworkTitle.trim()) return "Coursework title is required.";
    if (form.courseworkTitle.trim().length < 3) return "Coursework title must be at least 3 characters.";
    if (form.courseworkTitle.trim().length > 120) return "Coursework title must be under 120 characters.";
    if (!form.courseworkType) return "Please select a coursework type.";
    if (!form.deadline) return "Deadline is required.";
    const today = new Date().toISOString().split("T")[0];
    if (form.deadline < today) return "Deadline cannot be in the past.";
    const weight = Number(form.weightPercentage || 0);
    if (weight < 0 || weight > 100) return "Weight percentage must be between 0 and 100.";
    if (!form.semester) return "Please select a semester.";
    if (!form.groupNumber) return "Please select a group.";
    if (form.description.length > 500) return "Description must be under 500 characters.";
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
      formData.append("courseworkTitle", form.courseworkTitle);
      formData.append("courseworkType", form.courseworkType);
      formData.append("description", form.description);
      formData.append("deadline", form.deadline);
      formData.append("weightPercentage", form.weightPercentage);
      formData.append("semester", form.semester);
      formData.append("groupNumber", form.groupNumber);

      const file = fileRef.current?.files?.[0];
      if (file) formData.append("file", file);

      if (editingId) {
        const res = await updateCourseworkItem(editingId, formData);
        setRecords((prev) => prev.map((r) => (r._id === editingId ? res.data : r)));
      } else {
        const res = await createCourseworkItem(formData);
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
      courseworkTitle: record.courseworkTitle,
      courseworkType: record.courseworkType,
      description: record.description || "",
      deadline: record.deadline ? record.deadline.slice(0, 10) : "",
      weightPercentage: String(record.weightPercentage || ""),
      semester: String(record.semester),
      groupNumber: String(record.groupNumber),
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
      await deleteCourseworkItem(deleteTarget);
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
        <h2>Coursework Upload</h2>
        <p>Upload coursework details and documents for admin review and approval.</p>

        <h3 className="admin-subsection-title">Upload Coursework</h3>

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
            Coursework Title
            <input
              type="text"
              name="courseworkTitle"
              value={form.courseworkTitle}
              onChange={handleInputChange}
              placeholder="e.g. Assignment 1 - Design Patterns"
              required
            />
          </label>

          <label>
            Coursework Type
            <select name="courseworkType" value={form.courseworkType} onChange={handleInputChange} required>
              <option value="">Select Type</option>
              {COURSEWORK_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Deadline
            <input type="date" name="deadline" value={form.deadline} onChange={handleInputChange} min={todayDate} required />
          </label>

          <label>
            Weight Percentage
            <input
              type="number"
              name="weightPercentage"
              min="0"
              max="100"
              value={form.weightPercentage}
              onChange={handleInputChange}
              placeholder="e.g. 10"
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
            Group
            <select name="groupNumber" value={form.groupNumber} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </label>

          <label className="admin-form-span-2">
            Coursework File
            <div className="admin-file-input-wrapper">
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,.doc,.docx,.zip"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
              <span className="admin-file-input-label">
                <span className="file-btn-text">Browse</span>
                {fileName || "No file selected"}
              </span>
            </div>
            <span className="admin-file-hint">Accepted: PDF, DOC, DOCX, ZIP</span>
          </label>

          <label className="admin-form-span-full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Instructions and requirements for students"
            />
          </label>

          {error ? <p className="form-error admin-form-span-full">{error}</p> : null}

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Uploading..." : editingId ? "Update Coursework" : "Upload Coursework"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        <h3 className="admin-subsection-title">Submitted Coursework</h3>

        <div className="admin-data-table-wrap">
          {records.length === 0 ? <p>No coursework uploaded yet.</p> : null}

          {records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Deadline</th>
                  <th>Weight</th>
                  <th>File</th>
                  <th>Semester</th>
                  <th>Group</th>
                  <th>Uploaded</th>
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
                    <td>
                      <strong>{record.courseworkTitle}</strong>
                      {record.description ? <p className="admin-inline-note">{record.description}</p> : null}
                    </td>
                    <td>{record.courseworkType}</td>
                    <td>{formatDate(record.deadline)}</td>
                    <td>{record.weightPercentage}%</td>
                    <td>{record.fileName}</td>
                    <td>{record.semester}</td>
                    <td>{record.groupNumber}</td>
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
        title="Delete Coursework"
        message="Are you sure you want to delete this coursework? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default LecturerCourseworkUploadPage;
