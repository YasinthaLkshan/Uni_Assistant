import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { addGpaHistoryEntry } from "../utils/gpaHistory";
import { ROUTE_PATHS } from "../routes/routePaths";

import "./GpaCalculatorPage.css"; // Import new styles

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
  { label: "D+ (1.3)", value: 1.3 },
  { label: "D (1.0)", value: 1.0 },
  { label: "E (0.0)", value: 0.0 },
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
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Hi! I am your GPA AI Assistant. Need tips on improving your GPA or reaching Dean's List? Just ask!",
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
    if (gpa >= DEANS_LIST_THRESHOLD) return "excellent";
    if (gpa >= 3.0) return "success";
    if (gpa >= 2.0) return "warning";
    return "danger";
  })();

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

    setSaveStatus("Successfully saved to your history! 🚀");
    window.setTimeout(() => {
      setSaveStatus("");
    }, 2500);
  };

  const generateBotReply = (userText) => {
    const trimmed = userText.trim().toLowerCase();

    if (!totalCredits) {
      return "I notice you haven't added any credits yet. Start by entering your modules to calculate an estimated GPA!";
    }

    if (trimmed.includes("improve") || trimmed.includes("increase") || trimmed.includes("higher")) {
      if (gpa >= 3.5) {
        return `You're doing fantastic with a GPA of ${gpa.toFixed(2)}. Focus on consistency in high-credit modules.`;
      }
      if (gpa >= 2.5) {
        return `At ${gpa.toFixed(2)}, focus your energy on the next high-credit modules to quickly boost your score.`;
      }
      return `With a GPA of ${gpa.toFixed(2)}, prioritize passing all current modules and consider retaking subjects with lower grades next term.`;
    }

    if (trimmed.includes("good") || trimmed.includes("okay") || trimmed.includes("ok")) {
      if (gpa >= 3.7) {
        return `Absolutely! ${gpa.toFixed(2)} is an excellent GPA, often qualifying for Dean's List.`;
      }
      if (gpa >= 3.0) {
        return `${gpa.toFixed(2)} is a solid GPA. You're in good standing.`;
      }
      return `${gpa.toFixed(2)} is passing, but you might want to try to push it higher for more opportunities.`;
    }

    return `Your estimated GPA is currently ${gpa.toFixed(2)}. How else can I assist with your academic planning?`;
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
    setChatInput("");
    setIsChatThinking(true);

    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: generateBotReply(text) },
      ]);
      setIsChatThinking(false);
    }, 600);
  };

  return (
    <section className="modern-gpa-wrapper">
      <header className="modern-gpa-header">
        <h1>Calculate GPA</h1>
        <Link to={ROUTE_PATHS.gpaHistory} className="history-link-btn">
          View History
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
      </header>

      <div className="dashboard-grid-custom">
        
        {/* Left Column: Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* General Selectors */}
          <div className="premium-glass-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", padding: "1.5rem" }}>
            <div className="modern-input-group" style={{ marginBottom: 0 }}>
              <label className="modern-label" htmlFor="course-select">Program / Course</label>
              <select
                id="course-select"
                className="modern-select"
                value={selectedCourse}
                onChange={(event) => {
                  const nextCourse = event.target.value;
                  setSelectedCourse(nextCourse);
                  if (selectedSemester) applySemesterTemplate(nextCourse, selectedSemester);
                }}
              >
                {courseOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            
            <div className="modern-input-group" style={{ marginBottom: 0 }}>
              <label className="modern-label" htmlFor="semester-select">Academic Semester</label>
              <select
                id="semester-select"
                className="modern-select"
                value={selectedSemester}
                onChange={(event) => {
                  const nextSemester = event.target.value;
                  setSelectedSemester(nextSemester);
                  if (nextSemester) applySemesterTemplate(selectedCourse, nextSemester);
                }}
              >
                <option value="">Choose semester...</option>
                {semesterOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Module List */}
          <div className="premium-glass-card">
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700", margin: 0, color: "#1e293b" }}>Your Modules</h2>
              <p style={{ color: "#64748b", margin: "0.2rem 0 0", fontSize: "0.9rem" }}>Enter module name, credits, and expected grade to calculate.</p>
            </div>

            <div>
              {courses.map((course) => (
                <div key={course.id} className="course-row-card">
                  <div>
                    <label className="modern-label" style={{ fontSize: "0.75rem" }} htmlFor={`cname-${course.id}`}>Module Name</label>
                    <input
                      id={`cname-${course.id}`}
                      type="text"
                      className="modern-input"
                      placeholder="e.g. Data Structures"
                      value={course.name}
                      onChange={(e) => handleCourseChange(course.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="modern-label" style={{ fontSize: "0.75rem" }} htmlFor={`ccred-${course.id}`}>Credits</label>
                    <input
                      id={`ccred-${course.id}`}
                      type="number"
                      min="0" step="0.5"
                      className="modern-input"
                      placeholder="3"
                      value={course.credits}
                      onChange={(e) => handleCourseChange(course.id, "credits", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="modern-label" style={{ fontSize: "0.75rem" }} htmlFor={`cgrade-${course.id}`}>Grade</label>
                    <select
                      id={`cgrade-${course.id}`}
                      className="modern-select"
                      value={course.grade}
                      onChange={(e) => handleCourseChange(course.id, "grade", Number(e.target.value))}
                    >
                      {gradeOptions.map((o) => (
                        <option key={o.label} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    title="Remove module"
                    onClick={() => handleRemoveCourse(course.id)}
                    disabled={courses.length === 1}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="modern-actions">
              <button type="button" className="btn-add" onClick={handleAddCourse} disabled={isAtModuleLimit}>
                + Add Module
              </button>
              <button type="button" className="btn-reset" onClick={handleReset}>
                Reset Selection
              </button>
            </div>
          </div>
          
          {/* Marks Guide Reference Table */}
          <div className="marks-guide-wrapper">
             <div className="marks-guide-header">
                <h3>Uni Marks Guide</h3>
             </div>
             <div className="marks-list">
                {marksGuide.map((item) => (
                  <div key={item.grade} className="mark-item">
                    <span className="mark-grade">{item.grade}</span>
                    <span className="mark-point">{item.point.toFixed(1)} Points</span>
                    <span className="mark-range">{item.range} Marks</span>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column: Result & Chat */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Live GPA Display */}
          <div className="gpa-display-wrapper">
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#334155", margin: 0 }}>
              {selectedSemesterLabel ? `Result: ${selectedSemesterLabel}` : "Estimated GPA"}
            </h2>
            
            <div className="gpa-value-container">
              <div className={`gpa-score ${gpaLevel}`}>
                {gpa.toFixed(2)}
              </div>
              <div className="gpa-subtitle">out of 4.0</div>
            </div>

            <div className="gpa-stats">
              <div className="stat-item">
                <span className="stat-label">Credits</span>
                <span className="stat-value">{totalCredits}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Modules</span>
                <span className="stat-value">{validCount(courses)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-save-gpa"
              onClick={handleSaveToHistory}
              disabled={!canSaveToHistory}
            >
              {saveStatus ? saveStatus : "Save Calculation"}
            </button>
          </div>

          {/* AI Chat Widget */}
          <div className="ai-assistant-widget">
            <div className="ai-header">
              <div className="ai-avatar">✨</div>
              <div className="ai-header-text">
                <h3>AI Study Assistant</h3>
                <p>Always here to help you strategize</p>
              </div>
            </div>
            
            <div className="ai-messages">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`ai-message ${msg.from}`}>
                  {msg.text}
                </div>
              ))}
              {isChatThinking && (
                <div className="ai-message bot" style={{ display: "flex", gap: "5px", width: "fit-content" }}>
                  <span style={{ width: "6px", height: "6px", background: "#94a3b8", borderRadius: "50%", animation: "pulse 1s infinite" }}></span>
                  <span style={{ width: "6px", height: "6px", background: "#94a3b8", borderRadius: "50%", animation: "pulse 1s infinite 0.2s" }}></span>
                  <span style={{ width: "6px", height: "6px", background: "#94a3b8", borderRadius: "50%", animation: "pulse 1s infinite 0.4s" }}></span>
                </div>
              )}
            </div>

            <form className="ai-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="ai-input"
                placeholder="Ask how to reach 3.5..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="ai-send-btn"
                disabled={!chatInput.trim() || isChatThinking}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

function validCount(arr) {
  return arr.filter(c => Number(c.credits) > 0 && !Number.isNaN(Number(c.credits))).length;
}

export default GpaCalculatorPage;
