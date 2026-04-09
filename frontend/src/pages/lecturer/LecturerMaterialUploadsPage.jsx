import { useState, useEffect, useCallback, useRef } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getMyModules,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../services/lecturerService";

const MATERIAL_TYPES = [
  "Lecture Slides",
  "Notes",
  "Reading Material",
  "Lab Sheet",
  "Tutorial",
];

const EMPTY_FORM = {
  moduleCode: "",
  title: "",
  materialType: "",
  description: "",
  semester: "",
  groupNumber: "",
};

const LecturerMaterialUploadsPage = () => {
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
        const [modRes, matRes] = await Promise.all([getMyModules(), getMaterials()]);
        setModules(modRes.data || []);
        setRecords(matRes.data || []);
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

  const validateForm = () => {
    if (!form.moduleCode) return "Please select a module.";
    if (!form.title.trim()) return "Material title is required.";
    if (form.title.trim().length < 3) return "Material title must be at least 3 characters.";
    if (form.title.trim().length > 120) return "Material title must be under 120 characters.";
    if (!form.materialType) return "Please select a material type.";
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
      formData.append("title", form.title);
      formData.append("materialType", form.materialType);
      formData.append("description", form.description);
      formData.append("semester", form.semester);
      formData.append("groupNumber", form.groupNumber);

      const file = fileRef.current?.files?.[0];
      if (file) formData.append("file", file);

      if (editingId) {
        const res = await updateMaterial(editingId, formData);
        setRecords((prev) => prev.map((r) => (r._id === editingId ? res.data : r)));
      } else {
        const res = await createMaterial(formData);
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
    setForm({
      moduleCode: record.moduleCode,
      title: record.title,
      materialType: record.materialType,
      description: record.description || "",
      semester: String(record.semester),
      groupNumber: String(record.groupNumber),
    });
    setEditingId(record._id);
    if (fileRef.current) fileRef.current.value = "";
  };

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMaterial(deleteTarget);
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
        <h2>Material Uploads</h2>
        <p>Upload and manage lecture materials, lab sheets, and reading resources for your modules.</p>

        <h3 className="admin-subsection-title">Upload Material</h3>

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
            Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Material title"
              required
            />
          </label>

          <label>
            Material Type
            <select name="materialType" value={form.materialType} onChange={handleInputChange} required>
              <option value="">Select Type</option>
              {MATERIAL_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
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
            Group
            <select name="groupNumber" value={form.groupNumber} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </label>

          <label>
            File
            <input type="file" ref={fileRef} accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
          </label>

          <label className="admin-form-span-full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the material"
            />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Uploading..." : editingId ? "Update Material" : "Upload Material"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Uploaded Materials</h3>

        <div className="admin-data-table-wrap">
          {records.length === 0 ? <p>No materials uploaded yet.</p> : null}

          {records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Semester</th>
                  <th>Group</th>
                  <th>Uploaded</th>
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
                      <strong>{record.title}</strong>
                      {record.description ? <p className="admin-inline-note">{record.description}</p> : null}
                    </td>
                    <td>{record.materialType}</td>
                    <td>{record.fileName}</td>
                    <td>{record.fileSize}</td>
                    <td>{record.semester}</td>
                    <td>{record.groupNumber}</td>
                    <td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-"}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(record)}>
                          Edit
                        </button>
                        <button type="button" className="ui-btn is-ghost" onClick={() => setDeleteTarget(record._id)}>
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
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Material"
        message="Are you sure you want to delete this material? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default LecturerMaterialUploadsPage;
