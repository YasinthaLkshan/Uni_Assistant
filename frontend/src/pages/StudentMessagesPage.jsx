import { useEffect, useState } from "react";

import api from "../services/api";
import { extractApiErrorMessage } from "../utils/error";

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EMPTY_FORM = {
  receiverId: "",
  subject: "",
  content: "",
};

const StudentMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [msgsRes, lecRes] = await Promise.all([
        api.get("/student/messages"),
        api.get("/student/lecturers"),
      ]);
      setMessages(msgsRes.data.data || []);
      setLecturers(lecRes.data.data || []);
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

    if (!form.receiverId || !form.subject.trim() || !form.content.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.post("/student/messages", {
        receiverId: form.receiverId,
        subject: form.subject.trim(),
        content: form.content.trim(),
      });
      setSuccess("Message sent to lecturer");
      resetForm();
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/student/messages/${id}/read`);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const received = messages.filter((m) => m.senderRole === "lecturer");
  const sent = messages.filter((m) => m.receiverRole === "lecturer");

  return (
    <section className="dashboard section-entrance">
      {/* Send Message */}
      <div className="glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Communication</p>
        <h2 style={{ margin: "0.3rem 0" }}>Message a Lecturer</h2>

        <form style={{ display: "grid", gap: "0.8rem", marginTop: "1rem" }} onSubmit={handleSubmit}>
          <label>
            Select Lecturer
            <select name="receiverId" value={form.receiverId} onChange={handleInputChange} required style={{ width: "100%", marginTop: "0.3rem" }}>
              <option value="">Choose a lecturer</option>
              {lecturers.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.email})
                </option>
              ))}
            </select>
          </label>

          <label>
            Subject
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleInputChange}
              placeholder="Message subject"
              maxLength={200}
              required
              style={{ width: "100%", marginTop: "0.3rem" }}
            />
          </label>

          <label>
            Message
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              rows={4}
              placeholder="Write your message..."
              maxLength={3000}
              required
              style={{ width: "100%", marginTop: "0.3rem" }}
            />
          </label>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p style={{ color: "var(--success)", marginTop: "0.5rem", fontSize: "0.85rem" }}>{success}</p> : null}
      </div>

      {/* Received Messages */}
      <div className="glass-card" style={{ padding: "1.2rem 1.4rem" }}>
        <p className="eyebrow">Inbox</p>
        <h2 style={{ margin: "0.3rem 0" }}>Replies from Lecturers ({received.length})</h2>

        {loading ? <p>Loading...</p> : null}

        {!loading && received.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No replies yet.</p>
        ) : null}

        {!loading && received.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1rem" }}>
            {received.map((msg) => (
              <article
                key={msg._id}
                className="glass-card"
                style={{
                  padding: "0.8rem 1rem",
                  borderLeft: `3px solid ${msg.isRead ? "#94a3b8" : "#10b981"}`,
                  opacity: msg.isRead ? 0.85 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {!msg.isRead ? (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                      ) : null}
                      <h3 style={{ margin: 0, fontSize: "0.95rem" }}>{msg.subject}</h3>
                    </div>
                    <p style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.15rem" }}>
                      From: {msg.sender?.name || "Lecturer"}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", opacity: 0.5, whiteSpace: "nowrap" }}>{formatDate(msg.createdAt)}</span>
                </div>
                <p style={{ marginTop: "0.4rem", fontSize: "0.88rem", opacity: 0.85, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </p>
                {!msg.isRead ? (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(msg._id)}
                    style={{
                      marginTop: "0.4rem",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      color: "#10b981",
                      borderRadius: "6px",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    Mark as Read
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {/* Sent Messages */}
      {sent.length > 0 ? (
        <div className="glass-card" style={{ padding: "1.2rem 1.4rem" }}>
          <p className="eyebrow">Sent</p>
          <h2 style={{ margin: "0.3rem 0" }}>Sent Messages ({sent.length})</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
            {sent.map((msg) => (
              <article
                key={msg._id}
                className="glass-card"
                style={{ padding: "0.7rem 1rem", borderLeft: "3px solid #94a3b8" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "0.9rem" }}>{msg.subject}</h3>
                    <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.1rem" }}>
                      To: {msg.receiver?.name || "Lecturer"}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", opacity: 0.5 }}>{formatDate(msg.createdAt)}</span>
                </div>
                <p style={{ marginTop: "0.3rem", fontSize: "0.85rem", opacity: 0.8, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default StudentMessagesPage;
