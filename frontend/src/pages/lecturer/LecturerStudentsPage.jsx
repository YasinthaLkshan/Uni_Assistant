import { useEffect, useState } from "react";

import { getMyModules, getMyStudents } from "../../services/lecturerService";
import { extractApiErrorMessage } from "../../utils/error";

const LecturerStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await getMyModules();
        setModules(response.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      }
    };

    fetchModules();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");
        const filters = selectedModule ? { moduleCode: selectedModule } : {};
        const response = await getMyStudents(filters);
        setStudents(response.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedModule]);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer Module</p>
        <h2>My Students</h2>
        <p>Students enrolled in groups that take your modules.</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Module
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">All Modules</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod.moduleCode}>
                  {mod.moduleCode} - {mod.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Student List</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading students...</p> : null}
          {!loading && students.length === 0 ? <p>No students found.</p> : null}

          {!loading && students.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Semester</th>
                  <th>Group</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.studentId}</td>
                    <td>{student.fullName}</td>
                    <td>{student.semester}</td>
                    <td>{student.groupNumber}</td>
                    <td>
                      <span className={`admin-status-badge is-${student.registrationStatus || "pending"}`}>
                        {student.registrationStatus === "registered" ? "Registered" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </article>
    </section>
  );
};

export default LecturerStudentsPage;
