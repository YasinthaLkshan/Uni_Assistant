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

const REPLY_MIN = 2;
const REPLY_MAX = 3000;

const LecturerMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyForm, setReplyForm] = useState({ messageId: null, content: "" });
  const [replying, setReplying] = useState(false);
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/lecturer/messages");
      const allMsgs = data.data || [];

      // Filter only student-related messages
      const studentMsgs = allMsgs.filter(
        (m) => m.senderRole === "student" || m.receiverRole === "student"
      );
      setMessages(studentMsgs);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/lecturer/messages/${id}/read`);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    const content = replyForm.content.trim();
    if (!content) {
      setError("Reply content is required");
      return;
    }
    if (content.length < REPLY_MIN) {
      setError(`Reply must be at least ${REPLY_MIN} characters`);
      return;
    }
    if (content.length > REPLY_MAX) {
      setError(`Reply must be at most ${REPLY_MAX} characters`);
      return;
    }

    const originalMsg = messages.find((m) => m._id === replyForm.messageId);
    if (!originalMsg) {
      setError("Original message not found — refresh and try again");
      return;
    }
    if (!originalMsg.sender?._id) {
      setError("Cannot determine the original sender");
      return;
    }

    try {
      setReplying(true);
      setError("");
      setSuccess("");
      await api.post("/lecturer/messages", {
        receiverId: originalMsg.sender._id,
        subject: `Re: ${originalMsg.subject}`,
        content,
        parentMessage: originalMsg._id,
      });
      setSuccess("Reply sent");
      setReplyForm({ messageId: null, content: "" });
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setReplying(false);
    }
  };

  // Group messages by conversation (parent or self)
  const received = messages.filter((m) => m.senderRole === "student");
  const sent = messages.filter((m) => m.receiverRole === "student");

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Inbox</p>
        <h2>Student Messages ({received.length})</h2>
        <p>Messages received from students.</p>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        {loading ? <p>Loading...</p> : null}

        {!loading && received.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No messages from students yet.</p>
        ) : null}

        {!loading && received.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
            {received.map((msg) => (
              <article
                key={msg._id}
                className="admin-glass-card"
                style={{
                  padding: "0.8rem 1rem",
                  borderLeft: `3px solid ${msg.isRead ? "#94a3b8" : "#3b82f6"}`,
                  opacity: msg.isRead ? 0.8 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {!msg.isRead ? (
                        <span style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#3b82f6",
                          flexShrink: 0,
                        }} />
                      ) : null}
                      <h3 style={{ margin: 0, fontSize: "0.95rem" }}>{msg.subject}</h3>
                    </div>
                    <p style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.2rem" }}>
                      From: {msg.sender?.name || "Student"} ({msg.sender?.email || ""})
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", opacity: 0.5, whiteSpace: "nowrap" }}>
                    {formatDate(msg.createdAt)}
                  </span>
                </div>

                <p style={{ marginTop: "0.5rem", fontSize: "0.88rem", opacity: 0.85, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </p>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                  {!msg.isRead ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(msg._id)}
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        color: "#3b82f6",
                        borderRadius: "6px",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Mark as Read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      setReplyForm((prev) =>
                        prev.messageId === msg._id
                          ? { messageId: null, content: "" }
                          : { messageId: msg._id, content: "" }
                      )
                    }
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      color: "#10b981",
                      borderRadius: "6px",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    {replyForm.messageId === msg._id ? "Cancel" : "Reply"}
                  </button>
                </div>

                {replyForm.messageId === msg._id ? (
                  <form onSubmit={handleReply} style={{ marginTop: "0.6rem" }}>
                    <textarea
                      value={replyForm.content}
                      onChange={(e) => setReplyForm((prev) => ({ ...prev, content: e.target.value }))}
                      rows={3}
                      placeholder="Type your reply..."
                      minLength={REPLY_MIN}
                      maxLength={REPLY_MAX}
                      style={{ width: "100%", marginBottom: "0.4rem" }}
                      required
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <small style={{ color: "#64748b", fontSize: "0.72rem" }}>
                        {replyForm.content.trim().length} / {REPLY_MAX}
                      </small>
                      <button type="submit" className="primary-btn" disabled={replying} style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>
                        {replying ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </article>

      {sent.length > 0 ? (
        <article className="admin-glass-card admin-module-card">
          <p className="eyebrow">Sent</p>
          <h2>Replies Sent ({sent.length})</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
            {sent.map((msg) => (
              <article
                key={msg._id}
                className="admin-glass-card"
                style={{
                  padding: "0.7rem 1rem",
                  borderLeft: "3px solid #94a3b8",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "0.9rem" }}>{msg.subject}</h3>
                    <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.15rem" }}>
                      To: {msg.receiver?.name || "Student"}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", opacity: 0.5 }}>{formatDate(msg.createdAt)}</span>
                </div>
                <p style={{ marginTop: "0.4rem", fontSize: "0.85rem", opacity: 0.8, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </p>
              </article>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
};

export default LecturerMessagesPage;
