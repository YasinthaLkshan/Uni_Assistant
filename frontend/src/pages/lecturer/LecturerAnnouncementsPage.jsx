import { useEffect, useState } from "react";

import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/error";

const PRIORITY_STYLES = {
  normal: { background: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  important: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  urgent: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TITLE_MIN = 3;
const TITLE_MAX = 200;
const CONTENT_MIN = 10;
const CONTENT_MAX = 2000;
const PRIORITY_VALUES = ["normal", "important", "urgent"];

const EMPTY_FORM = {
  moduleCode: "",
  title: "",
  content: "",
  priority: "normal",
};

const LecturerAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [annRes, timetableRes] = await Promise.all([
        api.get("/lecturer/announcements"),
        api.get("/lecturer/my-timetable"),
      ]);
      setAnnouncements(annRes.data.data || []);

      // Extract unique modules from timetable
      const entries = timetableRes.data.data || [];
      const uniqueModules = [];
      const seen = new Set();
      for (const entry of entries) {
        if (!seen.has(entry.moduleCode)) {
          seen.add(entry.moduleCode);
          uniqueModules.push({
            code: entry.moduleCode,
            name: entry.moduleName || entry.moduleCode,
          });
        }
      }
      setModules(uniqueModules);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.moduleCode) {
      setError("Please select a module");
      return;
    }
    if (!modules.some((m) => m.code === form.moduleCode)) {
      setError("Selected module is not assigned to you");
      return;
    }

    const title = form.title.trim();
    if (!title) {
      setError("Title is required");
      return;
    }
    if (title.length < TITLE_MIN) {
      setError(`Title must be at least ${TITLE_MIN} characters`);
      return;
    }
    if (title.length > TITLE_MAX) {
      setError(`Title must be at most ${TITLE_MAX} characters`);
      return;
    }

    const content = form.content.trim();
    if (!content) {
      setError("Content is required");
      return;
    }
    if (content.length < CONTENT_MIN) {
      setError(`Content must be at least ${CONTENT_MIN} characters (currently ${content.length})`);
      return;
    }
    if (content.length > CONTENT_MAX) {
      setError(`Content must be at most ${CONTENT_MAX} characters`);
      return;
    }

    if (!PRIORITY_VALUES.includes(form.priority)) {
      setError("Invalid priority");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.post("/lecturer/announcements", {
        moduleCode: form.moduleCode,
        title,
        content,
        priority: form.priority,
      });
      setSuccess("Announcement posted successfully");
      resetForm();
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      setError("");
      await api.delete(`/lecturer/announcements/${id}`);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Communication</p>
        <h2>Post Announcement</h2>
        <p>Create announcements visible to students in your modules.</p>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label>
            Module
            <select name="moduleCode" value={form.moduleCode} onChange={handleInputChange} required>
              <option value="">Select module</option>
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleInputChange}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label className="admin-form-span-full">
            Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Announcement title"
              minLength={TITLE_MIN}
              maxLength={TITLE_MAX}
              required
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              {form.title.trim().length} / {TITLE_MAX} characters (min {TITLE_MIN})
            </small>
          </label>

          <label className="admin-form-span-full">
            Content
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              rows={4}
              placeholder="Write your announcement here (minimum 10 characters)..."
              minLength={CONTENT_MIN}
              maxLength={CONTENT_MAX}
              required
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              {form.content.trim().length} / {CONTENT_MAX} characters (min {CONTENT_MIN})
            </small>
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Posting..." : "Post Announcement"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}
      </article>

      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">History</p>
        <h2>My Announcements ({announcements.length})</h2>

        {loading ? <p>Loading...</p> : null}

        {!loading && announcements.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No announcements posted yet.</p>
        ) : null}

        {!loading && announcements.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
            {announcements.map((ann) => {
              const pStyle = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.normal;
              return (
                <article
                  key={ann._id}
                  className="admin-glass-card"
                  style={{
                    padding: "1rem 1.2rem",
                    borderLeft: `3px solid ${pStyle.color}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: "1rem" }}>{ann.title}</h3>
                        <span style={{
                          padding: "0.1rem 0.45rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          ...pStyle,
                        }}>
                          {ann.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.2rem" }}>
                        {ann.moduleCode} {ann.moduleName ? `- ${ann.moduleName}` : ""} | {formatDate(ann.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(ann._id)}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#ef4444",
                        borderRadius: "6px",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.85, whiteSpace: "pre-wrap" }}>
                    {ann.content}
                  </p>
                </article>
              );
            })}
          </div>
        ) : null}
      </article>
    </section>
  );
};

export default LecturerAnnouncementsPage;
