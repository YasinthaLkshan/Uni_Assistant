import { useEffect, useState } from "react";

import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/error";

const LecturerTimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/lecturer/my-timetable");
        setEntries(data.data || []);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Lecturer</p>
        <h2>My Timetable</h2>
        <p>Weekly timetable for your assigned modules.</p>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading timetable...</p> : null}
          {!loading && entries.length === 0 ? <p>No timetable entries found for your modules.</p> : null}

          {!loading && entries.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Module</th>
                  <th>Activity</th>
                  <th>Venue</th>
                  <th>Semester</th>
                  <th>Group</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.dayOfWeek}</td>
                    <td>
                      {entry.startTime} - {entry.endTime}
                    </td>
                    <td>
                      <strong>{entry.moduleCode}</strong>
                      <p className="admin-inline-note">{entry.moduleName || entry.moduleTitle || "-"}</p>
                    </td>
                    <td>{entry.activityType || "-"}</td>
                    <td>{entry.venue}</td>
                    <td>{entry.semester}</td>
                    <td>{entry.groupNumber}</td>
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

export default LecturerTimetablePage;
