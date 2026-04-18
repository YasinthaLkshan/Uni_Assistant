import { useEffect, useState } from "react";

import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/error";

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SUBJECT_MIN = 3;
const SUBJECT_MAX = 200;
const CONTENT_MIN = 10;
const CONTENT_MAX = 3000;

const EMPTY_FORM = {
  receiverId: "",
  subject: "",
  content: "",
};

const LecturerContactAdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [adminsRes, messagesRes] = await Promise.all([
        api.get("/lecturer/admins"),
        api.get("/lecturer/messages"),
      ]);
      setAdmins(adminsRes.data.data || []);

      // Filter only admin-related messages
      const allMsgs = messagesRes.data.data || [];
      const adminMsgs = allMsgs.filter(
        (m) => m.senderRole === "admin" || m.receiverRole === "admin"
      );
      setMessages(adminMsgs);
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

    if (!form.receiverId) {
      setError("Please select an admin recipient");
      return;
    }
    if (!admins.some((a) => a._id === form.receiverId)) {
      setError("Selected recipient is not a valid admin");
      return;
    }

    const subject = form.subject.trim();
    if (!subject) {
      setError("Subject is required");
      return;
    }
    if (subject.length < SUBJECT_MIN) {
      setError(`Subject must be at least ${SUBJECT_MIN} characters`);
      return;
    }
    if (subject.length > SUBJECT_MAX) {
      setError(`Subject must be at most ${SUBJECT_MAX} characters`);
      return;
    }

    const content = form.content.trim();
    if (!content) {
      setError("Message is required");
      return;
    }
    if (content.length < CONTENT_MIN) {
      setError(`Message must be at least ${CONTENT_MIN} characters (currently ${content.length})`);
      return;
    }
    if (content.length > CONTENT_MAX) {
      setError(`Message must be at most ${CONTENT_MAX} characters`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.post("/lecturer/messages", {
        receiverId: form.receiverId,
        subject,
        content,
      });
      setSuccess("Message sent to admin");
      resetForm();
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Communication</p>
        <h2>Contact Admin</h2>
        <p>Send a message to the administration.</p>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label className="admin-form-span-full">
            Select Admin
            <select name="receiverId" value={form.receiverId} onChange={handleInputChange} required>
              <option value="">Select admin</option>
              {admins.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          </label>

          <label className="admin-form-span-full">
            Subject
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleInputChange}
              placeholder="Message subject"
              minLength={SUBJECT_MIN}
              maxLength={SUBJECT_MAX}
              required
            />
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              {form.subject.trim().length} / {SUBJECT_MAX} characters (min {SUBJECT_MIN})
            </small>
          </label>

          <label className="admin-form-span-full">
            Message
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              rows={4}
              placeholder="Write your message here (minimum 10 characters)..."
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
              {submitting ? "Sending..." : "Send Message"}
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
        <h2>Admin Messages ({messages.length})</h2>

        {loading ? <p>Loading...</p> : null}

        {!loading && messages.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No messages with admin yet.</p>
        ) : null}

        {!loading && messages.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
            {messages.map((msg) => {
              const isSent = msg.senderRole === "lecturer";
              return (
                <article
                  key={msg._id}
                  className="admin-glass-card"
                  style={{
                    padding: "0.8rem 1rem",
                    borderLeft: `3px solid ${isSent ? "#3b82f6" : "#10b981"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                        background: isSent ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)",
                        color: isSent ? "#3b82f6" : "#10b981",
                      }}>
                        {isSent ? "Sent" : "Received"}
                      </span>
                      <h3 style={{ margin: "0.3rem 0 0", fontSize: "0.95rem" }}>{msg.subject}</h3>
                    </div>
                    <span style={{ fontSize: "0.75rem", opacity: 0.5, whiteSpace: "nowrap" }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.2rem" }}>
                    {isSent ? `To: ${msg.receiver?.name || "Admin"}` : `From: ${msg.sender?.name || "Admin"}`}
                  </p>
                  <p style={{ marginTop: "0.4rem", fontSize: "0.88rem", opacity: 0.85, whiteSpace: "pre-wrap" }}>
                    {msg.content}
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

export default LecturerContactAdminPage;
