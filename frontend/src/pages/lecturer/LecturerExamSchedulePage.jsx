import { useEffect, useMemo, useState } from "react";

import { getMyModules } from "../../services/lecturerService";
import { getPossibleExamDates } from "../../services/examScheduleService";
import { extractApiErrorMessage } from "../../utils/error";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const LecturerExamSchedulePage = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedModule = useMemo(() => {
    return modules.find((m) => m._id === selectedModuleId) || null;
  }, [modules, selectedModuleId]);

  const availableGroups = useMemo(() => {
    if (!selectedModule) return [];
    return selectedModule.assignedGroups || selectedModule.groups || [1, 2, 3];
  }, [selectedModule]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyModules();
        setModules(res.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      }
    };
    fetch();
  }, []);

  const loadExamDates = async () => {
    if (!selectedModuleId || !selectedGroup) return;
    try {
      setLoading(true);
      setError("");
      setExamData(null);
      const res = await getPossibleExamDates(selectedModuleId, selectedGroup);
      setExamData(res.data || null);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamDates();
  }, [selectedModuleId, selectedGroup]);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Exam Scheduling</p>
        <h2>Exam Date Finder</h2>
        <p>
          View possible exam dates for your modules. Exams must be held 1–2 weeks after the last lecture.
          Use this to find valid dates, then submit your exam paper on the Exam Papers page with the chosen date.
        </p>

        <h3 className="admin-subsection-title">Select Module & Group</h3>

        <div className="admin-filter-row">
          <label>
            Module
            <select value={selectedModuleId} onChange={(e) => { setSelectedModuleId(e.target.value); setSelectedGroup(""); setExamData(null); }}>
              <option value="">Select Module</option>
              {modules.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.moduleCode} - {m.title || m.moduleName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Group
            <select value={selectedGroup} onChange={(e) => { setSelectedGroup(e.target.value); setExamData(null); }} disabled={!selectedModuleId}>
              <option value="">Select Group</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>Group {g}</option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p>Calculating exam window...</p> : null}

        {examData ? (
          <>
            <h3 className="admin-subsection-title">Exam Window</h3>

            <div style={{
              padding: "1rem",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "1rem",
            }}>
              <p style={{ marginBottom: "0.4rem" }}>
                <strong>Last Lecture Date:</strong> {formatDate(examData.lastLectureDate)}
              </p>
              <p style={{ marginBottom: "0.4rem" }}>
                <strong>Exam Window:</strong> {formatDate(examData.windowStart)} to {formatDate(examData.windowEnd)}
              </p>
              <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                Exams must be held after a 1-week gap but within 2 weeks of the last lecture.
              </p>
            </div>

            <h3 className="admin-subsection-title">
              Possible Exam Dates ({examData.possibleDates?.length || 0})
            </h3>

            <div className="admin-data-table-wrap">
              {examData.possibleDates?.length === 0 ? (
                <p>No valid exam dates found in the window (all dates may be holidays or weekends).</p>
              ) : (
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examData.possibleDates.map((pd) => (
                      <tr key={formatDate(pd.date)}>
                        <td><strong>{formatDate(pd.date)}</strong></td>
                        <td>{pd.dayOfWeek}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{
              marginTop: "1rem",
              padding: "0.8rem",
              borderRadius: "6px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              fontSize: "0.85rem",
            }}>
              <strong>Next step:</strong> Go to the <strong>Exam Papers</strong> page to submit your exam paper with one of these dates.
              The exam date will be validated against this window automatically.
            </div>
          </>
        ) : null}

        {selectedModuleId && !selectedGroup ? (
          <p style={{ marginTop: "1rem", opacity: 0.6 }}>Select a group to see possible exam dates.</p>
        ) : null}
      </article>
    </section>
  );
};

export default LecturerExamSchedulePage;
