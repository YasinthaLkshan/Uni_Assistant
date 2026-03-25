import { useState } from "react";
import { Link } from "react-router-dom";

import { GlassCard, PrimaryButton, SecondaryButton, SectionTitle } from "../components";
import { useAuth } from "../hooks/useAuth";
import { addGpaHistoryEntry } from "../utils/gpaHistory";
import { ROUTE_PATHS } from "../routes/routePaths";

const DEANS_LIST_THRESHOLD = 3.7;

const gradeOptions = [
  { label: "A+ (4.0)", value: 4.0 },
  { label: "A (4.0)", value: 4.0 },
  { label: "A- (3.7)", value: 3.7 },
  { label: "B+ (3.3)", value: 3.3 },
  { label: "B (3.0)", value: 3.0 },
  { label: "B- (2.7)", value: 2.7 },
  { label: "C+ (2.3)", value: 2.3 },
  { label: "C (2.0)", value: 2.0 },
  { label: "C- (1.7)", value: 1.7 },
  { label: "D (1.0)", value: 1.0 },
  { label: "F (0.0)", value: 0.0 },
];

const marksGuide = [
  { grade: "A+", point: 4.0, range: "90-100" },
  { grade: "A", point: 4.0, range: "80-89" },
  { grade: "A-", point: 3.7, range: "75-79" },
  { grade: "B+", point: 3.3, range: "70-74" },
  { grade: "B", point: 3.0, range: "65-69" },
  { grade: "B-", point: 2.7, range: "60-64" },
  { grade: "C+", point: 2.3, range: "55-59" },
  { grade: "C", point: 2.0, range: "45-54" },
  { grade: "C-", point: 1.7, range: "40-44" },
  { grade: "D+", point: 1.3, range: "35-39" },
  { grade: "D", point: 1.0, range: "30-34" },
  { grade: "E", point: 0.0, range: "0-29" },
];

const courseOptions = [
  { label: "Software Engineering (SE)", value: "SE" },
  { label: "Data Science (DS)", value: "DS" },
  { label: "Information Technology (IT)", value: "IT" },
];

const sharedSemesterModules = {
  Y1S1: [
    { name: "IP", credits: 4 },
    { name: "ICS", credits: 4 },
    { name: "MC", credits: 4 },
    { name: "CS", credits: 3 },
  ],
  Y1S2: [
    { name: "OOC", credits: 2 },
    { name: "SPM", credits: 3 },
    { name: "EAP", credits: 3 },
    { name: "ISDM", credits: 4 },
    { name: "IWT", credits: 4 },
  ],
  Y2S1: [
    { name: "SE", credits: 4 },
    { name: "OOP", credits: 4 },
    { name: "DMS", credits: 4 },
    { name: "CN", credits: 4 },
    { name: "OSSA", credits: 4 },
  ],
  Y2S2: [
    { name: "MAD", credits: 4 },
    { name: "DSA", credits: 4 },
    { name: "ITP", credits: 4 },
    { name: "PS", credits: 2 },
    { name: "PAS", credits: 3 },
  ],
};

const courseSemesterModules = {
  SE: sharedSemesterModules,
  DS: sharedSemesterModules,
  IT: sharedSemesterModules,
};

const semesterOptions = [
  { label: "1st Year - 1st Semester", value: "Y1S1" },
  { label: "1st Year - 2nd Semester", value: "Y1S2" },
  { label: "2nd Year - 1st Semester", value: "Y2S1" },
  { label: "2nd Year - 2nd Semester", value: "Y2S2" },
];

const createEmptyCourse = () => ({
  id: crypto.randomUUID(),
  name: "",
  credits: "",
  grade: gradeOptions[0].value,
});

const calculateGpa = (courses) => {
  const validCourses = courses.filter((c) => Number(c.credits) > 0 && !Number.isNaN(Number(c.credits)));

  if (!validCourses.length) {
    return { gpa: 0, totalCredits: 0 };
  }

  const { totalPoints, totalCredits } = validCourses.reduce(
    (acc, course) => {
      const credits = Number(course.credits) || 0;
      return {
        totalPoints: acc.totalPoints + course.grade * credits,
        totalCredits: acc.totalCredits + credits,
      };
    },
    { totalPoints: 0, totalCredits: 0 },
  );

  if (!totalCredits) {
    return { gpa: 0, totalCredits: 0 };
  }

  return { gpa: totalPoints / totalCredits, totalCredits };
};

const getMaxModulesForSelection = (courseKey, semesterKey) => {
  const template = courseSemesterModules[courseKey]?.[semesterKey];
  return Array.isArray(template) ? template.length : null;
};

const GpaCalculatorPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([createEmptyCourse(), createEmptyCourse(), createEmptyCourse()]);
  const [selectedCourse, setSelectedCourse] = useState(courseOptions[0].value);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Hi, I am your GPA assistant. Ask me how to interpret or improve your GPA.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatThinking, setIsChatThinking] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showLimitToast, setShowLimitToast] = useState(false);

  const handleCourseChange = (id, field, value) => {
    setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, [field]: value } : course)));
  };

  const handleAddCourse = () => {
    const maxModules = getMaxModulesForSelection(selectedCourse, selectedSemester);

    if (maxModules && courses.length >= maxModules) {
      setShowLimitToast(true);
      window.setTimeout(() => {
        setShowLimitToast(false);
      }, 2600);
      return;
    }

    setCourses((prev) => [...prev, createEmptyCourse()]);
  };

  const handleRemoveCourse = (id) => {
    setCourses((prev) => (prev.length > 1 ? prev.filter((course) => course.id !== id) : prev));
  };

  const handleReset = () => {
    setCourses([createEmptyCourse(), createEmptyCourse(), createEmptyCourse()]);
    setSelectedSemester("");
  };

  const applySemesterTemplate = (courseKey, semesterKey) => {
    const template = courseSemesterModules[courseKey]?.[semesterKey];
    if (!template) return;

    setCourses(
      template.map((module) => ({
        id: crypto.randomUUID(),
        name: module.name,
        credits: String(module.credits),
        grade: gradeOptions[0].value,
      })),
    );
  };

  const { gpa, totalCredits } = calculateGpa(courses);

  const selectedSemesterLabel = selectedSemester
    ? semesterOptions.find((s) => s.value === selectedSemester)?.label || ""
    : "";

  const gpaLevel = (() => {
    if (!totalCredits) return "neutral";
    if (gpa >= DEANS_LIST_THRESHOLD) return "success";
    if (gpa >= 3.0) return "warning";
    return "danger";
  })();

  const normalizedGpa = Math.max(0, Math.min(4, gpa));

  const canSaveToHistory = Boolean(totalCredits && selectedSemester);
  const maxModulesForSelection = getMaxModulesForSelection(selectedCourse, selectedSemester);
  const isAtModuleLimit = Boolean(maxModulesForSelection && courses.length >= maxModulesForSelection);

  const handleSaveToHistory = () => {
    if (!canSaveToHistory) {
      setSaveStatus("Add credits and select a semester before saving.");
      return;
    }

    const userId = user?._id || user?.id || user?.email || "anonymous";

    const courseMeta = courseOptions.find((option) => option.value === selectedCourse) || null;

    addGpaHistoryEntry(userId, {
      id: crypto.randomUUID(),
      gpa: Number(gpa.toFixed(2)),
      totalCredits,
      semesterKey: selectedSemester,
      semesterLabel: selectedSemesterLabel,
      courseCode: selectedCourse,
      courseLabel: courseMeta?.label || selectedCourse,
      createdAt: new Date().toISOString(),
    });

    setSaveStatus("Saved to GPA history for this semester.");
    window.setTimeout(() => {
      setSaveStatus("");
    }, 2500);
  };

  const generateBotReply = (userText) => {
    const trimmed = userText.trim().toLowerCase();

    if (!totalCredits) {
      return "Start by adding your modules, credits and grades. Once I see a GPA, I can help you plan how to improve it.";
    }

    if (trimmed.includes("improve") || trimmed.includes("increase") || trimmed.includes("higher")) {
      if (gpa >= 3.5) {
        return `Your GPA is already strong at ${gpa.toFixed(2)}. Focus on keeping consistent grades in high-credit modules and avoid taking on too many risky courses at once.`;
      }

      if (gpa >= 2.5) {
        return `You are in a passing range with a GPA of ${gpa.toFixed(2)}. Improving grades in modules with the most credits will move your GPA the fastest.`;
      }

      return `With a GPA of ${gpa.toFixed(2)}, the priority is passing all modules and retaking or improving the lowest grades, especially where credits are high.`;
    }

    if (trimmed.includes("good") || trimmed.includes("okay") || trimmed.includes("ok")) {
      if (gpa >= 3.7) {
        return `Yes, ${gpa.toFixed(2)} is an excellent GPA. It is typically competitive for scholarships and honours, depending on your university.`;
      }

      if (gpa >= 3.0) {
        return `${gpa.toFixed(2)} is generally considered good. If you want it higher, look at which future modules carry more credits and plan to aim for A or A- there.`;
      }

      if (gpa >= 2.0) {
        return `${gpa.toFixed(2)} is usually a passing GPA, but could limit some opportunities. Improving just one or two high-credit modules can make a visible difference.`;
      }

      return `${gpa.toFixed(2)} is in an at-risk range. Talk with an advisor and use this calculator to test what grades you need next term to return to good standing.`;
    }

    return `Your current GPA is ${gpa.toFixed(2)} based on ${totalCredits} credits. You can ask me things like "How can I improve my GPA?" or "Is this GPA good enough for scholarships?"`;
  };

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const text = chatInput.trim();
    if (!text) return;

    const nextUserMessage = {
      id: Date.now(),
      from: "user",
      text,
    };

    setChatMessages((prev) => [...prev, nextUserMessage]);
    setChatInput("");
    setIsChatThinking(true);

    window.setTimeout(() => {
      const botReply = generateBotReply(text);
      const nextBotMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: botReply,
      };

      setChatMessages((prev) => [...prev, nextBotMessage]);
      setIsChatThinking(false);
    }, 260);
  };

  return (
    <section className="dashboard gpa-page">
      <div className="section-entrance" style={{ animationDelay: "20ms", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--ink-900)", margin: 0, letterSpacing: "-0.01em" }}>
          Semester GPA calculator
        </h1>
        <Link 
          to={ROUTE_PATHS.gpaHistory} 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", background: "#000", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          View GPA History
        </Link>
      </div>

      <div className="dashboard-grid" style={{ animationDelay: "60ms", display: "grid", gridTemplateColumns: "1fr", gap: "2rem", alignItems: "start", marginTop: "1.5rem" }}>
        <style>{`
          @media (min-width: 900px) {
            .dashboard-grid { grid-template-columns: 2.2fr 1fr !important; }
          }
        `}</style>
        <GlassCard as="section" className="ui-section gpa-inputs">
          <SectionTitle
            eyebrow="Your Modules"
            title="Enter modules and grades"
            className="gpa-section-title"
          />

          <div className="gpa-field-group" style={{ marginBottom: "1.25rem" }}>
            <label className="field-label" htmlFor="course-select">
              Course
            </label>
            <select
              id="course-select"
              className="text-input"
              value={selectedCourse}
              onChange={(event) => {
                const nextCourse = event.target.value;
                setSelectedCourse(nextCourse);
                if (selectedSemester) {
                  applySemesterTemplate(nextCourse, selectedSemester);
                }
              }}
            >
              {courseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="gpa-field-group" style={{ marginBottom: "1.5rem" }}>
            <label className="field-label" htmlFor="semester-select">
              Semester
            </label>
            <select
              id="semester-select"
              className="text-input"
              value={selectedSemester}
              onChange={(event) => {
                const nextSemester = event.target.value;
                setSelectedSemester(nextSemester);
                if (nextSemester) {
                  applySemesterTemplate(selectedCourse, nextSemester);
                }
              }}
            >
              <option value="">Select semester…</option>
              {semesterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="gpa-course-list">
            {courses.map((course, index) => (
              <div key={course.id} className="gpa-course-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr auto", gap: "1rem", alignItems: "start", padding: "1.2rem", background: "var(--glass)", borderRadius: "12px", border: "1px solid var(--line)", marginBottom: "1rem", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)" }}>
                <div className="gpa-field-group" style={{ marginBottom: 0 }}>
                  <label className="field-label" htmlFor={`course-name-${course.id}`} style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--ink-700)", marginBottom: "0.4rem", display: "block" }}>
                    Module Name
                  </label>
                  <input
                    id={`course-name-${course.id}`}
                    type="text"
                    className="text-input"
                    placeholder="e.g. Data Structures"
                    value={course.name}
                    onChange={(e) => handleCourseChange(course.id, "name", e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--line-strong)", background: "var(--bg-2)", color: "var(--ink-900)" }}
                  />
                </div>

                <div className="gpa-field credits" style={{ marginBottom: 0 }}>
                  <label className="field-label" htmlFor={`course-credits-${course.id}`} style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--ink-700)", marginBottom: "0.4rem", display: "block" }}>
                    Credits
                  </label>
                  <input
                    id={`course-credits-${course.id}`}
                    type="number"
                    min="0"
                    step="0.5"
                    className="text-input"
                    placeholder="e.g. 3"
                    value={course.credits}
                    onChange={(e) => handleCourseChange(course.id, "credits", e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--line-strong)", background: "var(--bg-2)", color: "var(--ink-900)" }}
                  />
                </div>

                <div className="gpa-field grade" style={{ marginBottom: 0 }}>
                  <label className="field-label" htmlFor={`course-grade-${course.id}`} style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--ink-700)", marginBottom: "0.4rem", display: "block" }}>
                    Grade
                  </label>
                  <select
                    id={`course-grade-${course.id}`}
                    className="text-input"
                    value={course.grade}
                    onChange={(e) => handleCourseChange(course.id, "grade", Number(e.target.value))}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--line-strong)", background: "var(--bg-2)", color: "var(--ink-900)" }}
                  >
                    {gradeOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="icon-btn"
                  title="Remove module"
                  style={{ border: "none", background: courses.length === 1 ? "transparent" : "rgba(239, 68, 68, 0.08)", color: courses.length === 1 ? "var(--ink-500)" : "var(--danger)", marginTop: "1.7rem", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", cursor: courses.length === 1 ? "not-allowed" : "pointer" }}
                  onClick={() => handleRemoveCourse(course.id)}
                  disabled={courses.length === 1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="gpa-actions">
            <SecondaryButton type="button" onClick={handleAddCourse} disabled={isAtModuleLimit}>
              Add another module
            </SecondaryButton>
            <button type="button" className="ghost-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <GlassCard as="aside" className="ui-section gpa-summary">
          <SectionTitle
            eyebrow="Result"
            title={selectedSemesterLabel ? `GPA ${selectedSemesterLabel}` : "Estimated GPA"}
          />

          <div className="gpa-value-wrap">
            <p className={`gpa-value gpa-value-${gpaLevel}`}>{gpa.toFixed(2)}</p>
          </div>

          {totalCredits > 0 && (
            <div className="gpa-deans-chart" style={{ marginTop: "0.75rem" }}>
              <div
                style={{
                  position: "relative",
                  height: "12px",
                  borderRadius: "999px",
                  background: "rgba(37,99,235,0.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${(normalizedGpa / 4) * 100}%`,
                    background: "#16a34a",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${(DEANS_LIST_THRESHOLD / 4) * 100}%`,
                    width: "2px",
                    background: "#2563eb",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  opacity: 0.8,
                }}
              >
                <span>0.0</span>
                <span>
                  Dean&apos;s List
                  {" "}
                  {DEANS_LIST_THRESHOLD.toFixed(1)}
                </span>
                <span>4.0</span>
              </div>
            </div>
          )}

          {totalCredits > 0 && (
            <div className="gpa-details">
              <p className="gpa-detail-line">
                <span className="gpa-detail-label">Total credits:</span> {totalCredits}
              </p>
              <p className="gpa-detail-line">
                <span className="gpa-detail-label">Current GPA:</span> {gpa.toFixed(2)}
              </p>
            </div>
          )}

          <div className="gpa-history-actions">
            <PrimaryButton
              type="button"
              onClick={handleSaveToHistory}
              disabled={!canSaveToHistory}
            >
              Save this calculation
            </PrimaryButton>
            {!canSaveToHistory && (
              <p className="gpa-history-hint">
                Select a semester and enter at least one module with credits to save.
              </p>
            )}
            {saveStatus && (
              <p className="gpa-history-status">
                {saveStatus}
              </p>
            )}
          </div>

          {totalCredits > 0 && gpa < 2 && (
            <p className="gpa-warning-message">
              Warning: your GPA is below 2.0. You may be at academic risk and should consider speaking with your academic advisor.
            </p>
          )}

          {totalCredits > 0 && gpa >= 3.7 && (
            <p className="gpa-deans-list-message">
              Congratulations! With a GPA of
              {" "}
              {gpa.toFixed(2)} you may qualify for the Dean&apos;s List, depending on your university&apos;s rules.
            </p>
          )}

          <div className="gpa-marks-guide">
            <h3 className="gpa-marks-guide-title">Marks Guide</h3>
            <div className="gpa-marks-guide-table" aria-label="Grade to GPA and marks guide">
              <div className="gpa-marks-guide-row gpa-marks-guide-header">
                <span>Grade</span>
                <span>Grade Point</span>
                <span>Marks Range</span>
              </div>
              {marksGuide.map((item) => (
                <div key={item.grade} className="gpa-marks-guide-row">
                  <span>{item.grade}</span>
                  <span>{item.point.toFixed(1)}</span>
                  <span>{item.range}</span>
                </div>
              ))}
            </div>
          </div>

        </GlassCard>

        {/* New Dedicated Chat Box */}
        <GlassCard as="section" className="ui-section gpa-chat-box" aria-label="AI GPA assistant" style={{ background: "var(--glass-strong)", border: "1px solid var(--line)", padding: "1.2rem", borderRadius: "12px", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
          <header className="gpa-chat-header" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.2rem", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", color: "#16a34a", borderRadius: "8px" }}>🤖</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600", color: "var(--ink-900)" }}>AI Assistant</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--ink-500)" }}>Ask about your GPA strategy</p>
            </div>
          </header>

          <div className="gpa-chat-messages" style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxHeight: "250px", minHeight: "150px", overflowY: "auto", paddingRight: "0.5rem", marginBottom: "0.8rem" }}>
            {chatMessages.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.from === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                  padding: "0.7rem 0.9rem",
                  borderRadius: message.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: message.from === "user" ? "#000" : "var(--bg-2)",
                  color: message.from === "user" ? "#fff" : "var(--ink-900)",
                  border: message.from === "user" ? "none" : "1px solid var(--line)",
                  fontSize: "0.85rem",
                  lineHeight: "1.4"
                }}
              >
                <p style={{ margin: 0 }}>{message.text}</p>
              </div>
            ))}
            {isChatThinking && (
              <div style={{ background: "var(--bg-2)", padding: "0.5rem 0.8rem", borderRadius: "12px 12px 12px 2px", border: "1px solid var(--line)", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "5px", height: "5px", background: "var(--ink-500)", borderRadius: "50%", animation: "pulse 1.2s infinite" }} />
                <span style={{ width: "5px", height: "5px", background: "var(--ink-500)", borderRadius: "50%", animation: "pulse 1.2s infinite 0.2s" }} />
                <span style={{ width: "5px", height: "5px", background: "var(--ink-500)", borderRadius: "50%", animation: "pulse 1.2s infinite 0.4s" }} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--line-strong)", paddingTop: "1rem", marginTop: "auto" }}>
            <input
              type="text"
              placeholder="Ask how to improve..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              style={{ flexGrow: 1, padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line-strong)", background: "var(--bg-2)", color: "var(--ink-900)", fontSize: "0.85rem", width: "100%" }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatThinking}
              style={{ padding: "0 1rem", borderRadius: "8px", background: "#000", color: "#fff", border: "none", fontWeight: "500", fontSize: "0.85rem", cursor: (!chatInput.trim() || isChatThinking) ? "not-allowed" : "pointer", opacity: (!chatInput.trim() || isChatThinking) ? 0.5 : 1, transition: "transform 0.2s, opacity 0.2s" }}
            >
              Ask
            </button>
          </form>
        </GlassCard>
        </div>
      </div>
      {showLimitToast && (
        <div className="toast toast-gpa-limit" role="status" aria-live="polite">
          <p className="toast-title">Limit Reached</p>
          <p className="toast-body">You have already added all the required modules for this semester.</p>
        </div>
      )}
    </section>
  );
};

export default GpaCalculatorPage;
