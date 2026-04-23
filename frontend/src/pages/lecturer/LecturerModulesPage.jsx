import { useEffect, useState } from "react";

import { getMyModules } from "../../services/lecturerService";
import { extractApiErrorMessage } from "../../utils/error";

const LecturerModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await getMyModules();
        setModules(response.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer Module</p>
        <h2>My Modules</h2>
        <p>Modules assigned to you for the current academic period.</p>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading modules...</p> : null}
          {!loading && modules.length === 0 ? <p>No modules assigned to you yet.</p> : null}

          {!loading && modules.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Module Code</th>
                  <th>Title</th>
                  <th>Semester</th>
                  <th>Groups</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod._id}>
                    <td><strong>{mod.moduleCode}</strong></td>
                    <td>{mod.title}</td>
                    <td>{mod.semester}</td>
                    <td>{mod.groups?.join(", ") || "-"}</td>
                    <td>{mod.credits}</td>
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

export default LecturerModulesPage;
