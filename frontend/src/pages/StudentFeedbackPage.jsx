import { useEffect, useState } from "react";

import api from "../services/api";
import { extractApiErrorMessage } from "../utils/error";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

const SENTIMENT_STYLES = {
  positive: { background: "rgba(34,197,94,0.12)", color: "#22c55e" },
  neutral: { background: "rgba(148,163,184,0.12)", color: "#94a3b8" },
  negative: { background: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

const StarRating = ({ label, name, value, onChange }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
    <span style={{ fontSize: "0.88rem", opacity: 0.85, fontWeight: 500 }}>{label}</span>
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(name, star)}
          aria-label={`${star} star`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.6rem",
            color: star <= value ? "#fbbf24" : "rgba(148,163,184,0.4)",
            padding: "0 0.1rem",
            transition: "color 0.15s",
          }}
        >
          &#9733;
        </button>
      ))}
      {value > 0 && (
        <span style={{ fontSize: "0.8rem", opacity: 0.7, alignSelf: "center", marginLeft: "0.3rem" }}>
          {RATING_LABELS[value]}
        </span>
      )}
    </div>
  </label>
);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const EMPTY_FORM = {
  overallRating: 0,
  teachingQuality: 0,
  contentClarity: 0,
  engagementLevel: 0,
  comment: "",
};

const StudentFeedbackPage = () => {
  const [modules, setModules] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [modRes, myRes] = await Promise.all([
        api.get("/feedback/modules"),
        api.get("/feedback/my"),
      ]);
      setModules(modRes.data.data || []);
      setMyFeedbacks(myRes.data.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRatingChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (mod) => {
    setSelectedModule(mod);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedModule) return;

    const { overallRating, teachingQuality, contentClarity, engagementLevel } = form;
    if (!overallRating || !teachingQuality || !contentClarity || !engagementLevel) {
      setError("Please fill in all ratings before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.post("/feedback/submit", {
        lecturerId: selectedModule.lecturer._id,
        moduleCode: selectedModule.moduleCode,
        moduleName: selectedModule.moduleName,
        overallRating,
        teachingQuality,
        contentClarity,
        engagementLevel,
        comment: form.comment,
      });
      setSuccess(`Feedback submitted for ${selectedModule.moduleName}. Thank you!`);
      setSelectedModule(null);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const availableModules = modules.filter((m) => !m.alreadySubmitted);
  const submittedModules = modules.filter((m) => m.alreadySubmitted);

  return (
    <section className="dashboard section-entrance">
      {/* Module Selection */}
      <div className="glass-card" style={{ padding: "1.2rem 1.4rem", marginBottom: "1.2rem" }}>
        <p className="eyebrow">Feedback</p>
        <h2 style={{ margin: "0.3rem 0" }}>Submit Lecture Feedback</h2>
        <p style={{ opacity: 0.7 }}>Rate your modules to help improve teaching quality.</p>

        {loading ? <p style={{ marginTop: "1rem" }}>Loading modules...</p> : null}

        {!loading && availableModules.length === 0 && submittedModules.length === 0 ? (
          <p style={{ opacity: 0.6, marginTop: "1rem" }}>No modules found. Contact admin if this is incorrect.</p>
        ) : null}

        {!loading && availableModules.length > 0 ? (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.7rem" }}>
              Select a module to rate:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {availableModules.map((mod) => (
                <button
                  key={mod.moduleCode}
                  type="button"
                  onClick={() => handleSelect(mod)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: selectedModule?.moduleCode === mod.moduleCode
                      ? "2px solid #6366f1"
                      : "1px solid rgba(255,255,255,0.1)",
                    background: selectedModule?.moduleCode === mod.moduleCode
                      ? "rgba(99,102,241,0.15)"
                      : "rgba(255,255,255,0.05)",
                    color: "inherit",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{mod.moduleCode}</div>
                  <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>{mod.moduleName}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.55, marginTop: "0.2rem" }}>
                    {mod.lecturer?.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && submittedModules.length > 0 ? (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.82rem", opacity: 0.55, marginBottom: "0.4rem" }}>
              Already submitted:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {submittedModules.map((mod) => (
                <span
                  key={mod.moduleCode}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "6px",
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    color: "#22c55e",
                    fontSize: "0.78rem",
                  }}
                >
                  {mod.moduleCode} &#10003;
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Feedback Form */}
      {selectedModule ? (
        <div className="glass-card" style={{ padding: "1.4rem", marginBottom: "1.2rem" }}>
          <h3 style={{ margin: "0 0 0.3rem" }}>{selectedModule.moduleName}</h3>
          <p style={{ fontSize: "0.82rem", opacity: 0.6, margin: "0 0 1.2rem" }}>
            Lecturer: {selectedModule.lecturer?.name} &bull; {selectedModule.moduleCode}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              <StarRating
                label="Overall Rating"
                name="overallRating"
                value={form.overallRating}
                onChange={handleRatingChange}
              />
              <StarRating
                label="Teaching Quality"
                name="teachingQuality"
                value={form.teachingQuality}
                onChange={handleRatingChange}
              />
              <StarRating
                label="Content Clarity"
                name="contentClarity"
                value={form.contentClarity}
                onChange={handleRatingChange}
              />
              <StarRating
                label="Engagement Level"
                name="engagementLevel"
                value={form.engagementLevel}
                onChange={handleRatingChange}
              />
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.88rem", opacity: 0.85, fontWeight: 500 }}>
                Comments (optional)
              </span>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                maxLength={1000}
                placeholder="Share suggestions, what you liked, or areas to improve..."
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "0.7rem",
                  color: "inherit",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <span style={{ fontSize: "0.75rem", opacity: 0.45, textAlign: "right" }}>
                {form.comment.length}/1000 &bull; Submitted anonymously
              </span>
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <div style={{ display: "flex", gap: "0.8rem" }}>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => { setSelectedModule(null); setError(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            padding: "0.9rem 1.2rem",
            borderRadius: "10px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "#22c55e",
            marginBottom: "1.2rem",
            fontSize: "0.9rem",
          }}
        >
          {success}
        </div>
      ) : null}

      {/* My Submitted Feedback */}
      {myFeedbacks.length > 0 ? (
        <div className="glass-card" style={{ padding: "1.2rem 1.4rem" }}>
          <p className="eyebrow">History</p>
          <h3 style={{ margin: "0.3rem 0 1rem" }}>My Submitted Feedback ({myFeedbacks.length})</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {myFeedbacks.map((fb) => {
              const sStyle = SENTIMENT_STYLES[fb.sentiment] || SENTIMENT_STYLES.neutral;
              return (
                <article
                  key={fb._id}
                  className="glass-card"
                  style={{ padding: "1rem 1.2rem", borderLeft: `3px solid ${sStyle.color}` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{fb.moduleName || fb.moduleCode}</h4>
                      <p style={{ fontSize: "0.78rem", opacity: 0.6, margin: "0.2rem 0" }}>
                        {fb.moduleCode} &bull; {fb.lecturer?.name || "Lecturer"} &bull; {formatDate(fb.createdAt)}
                      </p>
                    </div>
                    <span style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      ...sStyle,
                      alignSelf: "flex-start",
                    }}>
                      {fb.sentiment}
                    </span>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.5rem",
                    marginTop: "0.8rem",
                  }}>
                    {[
                      { label: "Overall", value: fb.overallRating },
                      { label: "Teaching", value: fb.teachingQuality },
                      { label: "Clarity", value: fb.contentClarity },
                      { label: "Engagement", value: fb.engagementLevel },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fbbf24" }}>
                          {"★".repeat(value)}{"☆".repeat(5 - value)}
                        </div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {fb.comment ? (
                    <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.7rem", whiteSpace: "pre-wrap" }}>
                      "{fb.comment}"
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default StudentFeedbackPage;
