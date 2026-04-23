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

const AdminMessagesPage = () => {
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
      const { data } = await api.get("/admin/messages");
      setMessages(data.data || []);
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
      await api.put(`/admin/messages/${id}/read`);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyForm.content.trim()) {
      setError("Reply content is required");
      return;
    }

    const originalMsg = messages.find((m) => m._id === replyForm.messageId);
    if (!originalMsg) return;

    try {
      setReplying(true);
      setError("");
      setSuccess("");
      await api.post("/admin/messages", {
        receiverId: originalMsg.sender._id,
        subject: `Re: ${originalMsg.subject}`,
        content: replyForm.content.trim(),
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

  const received = messages.filter((m) => m.receiverRole === "admin" && m.senderRole !== "admin");
  const sent = messages.filter((m) => m.senderRole === "admin");

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Inbox</p>
        <h2>Messages ({received.length})</h2>
        <p>Messages received from lecturers. Reply or mark as read once handled.</p>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="admin-action-note">{success}</p> : null}

        <h3 className="admin-subsection-title">Received</h3>

        {loading ? <p>Loading...</p> : null}
        {!loading && received.length === 0 ? <p>No messages received.</p> : null}

        {!loading && received.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "0.4rem" }}>
            {received.map((msg) => (
              <article
                key={msg._id}
                className="admin-glass-card"
                style={{
                  padding: "0.9rem 1.1rem",
                  borderLeft: `3px solid ${msg.isRead ? "#94a3b8" : "#5a67d8"}`,
                  opacity: msg.isRead ? 0.92 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {!msg.isRead ? (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5a67d8", flexShrink: 0 }} />
                      ) : null}
                      <h3 style={{ margin: 0, fontSize: "0.98rem" }}>{msg.subject}</h3>
                    </div>
                    <p style={{ fontSize: "0.78rem", opacity: 0.65, marginTop: "0.2rem" }}>
                      From: {msg.sender?.name || "Lecturer"} ({msg.sender?.email || ""}) — {msg.senderRole}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", opacity: 0.55, whiteSpace: "nowrap" }}>{formatDate(msg.createdAt)}</span>
                </div>

                <p style={{ marginTop: "0.55rem", fontSize: "0.9rem", opacity: 0.88, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </p>

                <div className="admin-row-actions" style={{ marginTop: "0.6rem" }}>
                  {!msg.isRead ? (
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => handleMarkRead(msg._id)}
                      style={{ padding: "0.3rem 0.8rem", fontSize: "0.78rem" }}
                    >
                      Mark as Read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() =>
                      setReplyForm((prev) =>
                        prev.messageId === msg._id
                          ? { messageId: null, content: "" }
                          : { messageId: msg._id, content: "" }
                      )
                    }
                    style={{ padding: "0.3rem 0.9rem", fontSize: "0.78rem" }}
                  >
                    {replyForm.messageId === msg._id ? "Cancel" : "Reply"}
                  </button>
                </div>

                {replyForm.messageId === msg._id ? (
                  <form
                    onSubmit={handleReply}
                    className="admin-form-grid admin-module-form-grid"
                    style={{ marginTop: "0.8rem" }}
                  >
                    <label className="admin-form-span-full">
                      Your reply
                      <textarea
                        value={replyForm.content}
                        onChange={(e) => setReplyForm((prev) => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        placeholder="Type your reply..."
                        required
                      />
                    </label>
                    <div className="admin-form-actions admin-form-span-full">
                      <button type="submit" className="primary-btn" disabled={replying}>
                        {replying ? "Sending..." : "Send Reply"}
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => setReplyForm({ messageId: null, content: "" })}
                      >
                        Cancel
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
          <h2>Sent Replies ({sent.length})</h2>

          <h3 className="admin-subsection-title">Outbox</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.4rem" }}>
            {sent.map((msg) => (
              <article
                key={msg._id}
                className="admin-glass-card"
                style={{ padding: "0.8rem 1rem", borderLeft: "3px solid #94a3b8" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "0.92rem" }}>{msg.subject}</h3>
                    <p style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.15rem" }}>
                      To: {msg.receiver?.name || "User"}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", opacity: 0.55 }}>{formatDate(msg.createdAt)}</span>
                </div>
                <p style={{ marginTop: "0.35rem", fontSize: "0.86rem", opacity: 0.82, whiteSpace: "pre-wrap" }}>
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

export default AdminMessagesPage;
