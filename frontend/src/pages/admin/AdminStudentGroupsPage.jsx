import { useState } from "react";

import { PageHeader, GlassCard } from "../../components";

const AdminStudentGroupsPage = () => {
  const [records, setRecords] = useState([]);

  return (
    <section className="dashboard admin-page">
      <GlassCard className="section-entrance" style={{ animationDelay: "40ms" }}>
        <PageHeader
          eyebrow="Management"
          title="Student Groups"
          subtitle="Organize students into groups for batch operations and scheduling"
        />
      </GlassCard>

      <GlassCard as="section" className="ui-section section-entrance" style={{ animationDelay: "100ms" }}>
        <div className="admin-form-section">
          <h3>Create New Group</h3>
          <form className="admin-form">
            <div className="form-group">
              <label>Semester</label>
              <input type="number" placeholder="Enter semester" />
            </div>
            <div className="form-group">
              <label>Group Number</label>
              <input type="number" placeholder="Enter group number" />
            </div>
            <div className="form-group">
              <label>Group Name</label>
              <input type="text" placeholder="Enter group name" />
            </div>
            <div className="form-group">
              <label>Max Students</label>
              <input type="number" placeholder="Enter max students" />
            </div>
            <button type="submit" className="primary-btn">Create Group</button>
          </form>
        </div>

        <div className="admin-table-container">
          <h3>Student Groups</h3>
          <table className="admin-table">
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
              <tr>
                <td colSpan="5" className="empty-row">No groups found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </section>
  );
};

export default AdminStudentGroupsPage;
