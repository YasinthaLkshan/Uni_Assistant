import { useState } from "react";

const AdminStudentGroupsPage = () => {
  const [records] = useState([]);

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Management</p>
        <h2>Student Groups</h2>
        <p>Organize students into groups for batch operations and scheduling.</p>

        <h3 className="admin-subsection-title">Create New Group</h3>

        <form className="admin-form-grid admin-module-form-grid">
          <label>
            Semester
            <input type="number" name="semester" placeholder="Enter semester" />
          </label>

          <label>
            Group Number
            <input type="number" name="groupNumber" placeholder="Enter group number" />
          </label>

          <label>
            Group Name
            <input type="text" name="groupName" placeholder="Enter group name" />
          </label>

          <label>
            Max Students
            <input type="number" name="maxStudents" placeholder="Enter max students" />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn">Create Group</button>
            <button type="reset" className="ghost-btn">Clear</button>
          </div>
        </form>

        <h3 className="admin-subsection-title">Student Groups ({records.length})</h3>

        <div className="admin-data-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Group Number</th>
                <th>Group Name</th>
                <th>Max Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5">No groups found</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default AdminStudentGroupsPage;
