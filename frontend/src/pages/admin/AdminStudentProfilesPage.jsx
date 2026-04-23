import { useEffect, useState } from "react";

import { PageHeader, SectionTitle, GlassCard } from "../../components";
import AdminAcademicEntityPage from "./AdminAcademicEntityPage";
import { listStudentProfiles } from "../../services/studentProfileService";

const AdminStudentProfilesPage = () => {
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await listStudentProfiles();
      setStudentProfiles(response.data || []);
    } catch (error) {
      console.error("Failed to load student profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard admin-page">
      <GlassCard className="section-entrance" style={{ animationDelay: "40ms" }}>
        <PageHeader
          eyebrow="Management"
          title="Student Profiles"
          subtitle="Manage student profile information, enrollment status, and academic details"
        />
      </GlassCard>

      <GlassCard as="section" className="ui-section section-entrance" style={{ animationDelay: "100ms" }}>
        <SectionTitle
          eyebrow="Records"
          title={`Total Students: ${studentProfiles.length}`}
          className="admin-section-title"
        />

        {loading ? (
          <div className="loading-state">Loading student profiles...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Semester</th>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentProfiles.map((profile) => (
                  <tr key={profile._id}>
                    <td>{profile.studentId || "-"}</td>
                    <td>{profile.name || "-"}</td>
                    <td>{profile.email || "-"}</td>
                    <td>{profile.semester || "-"}</td>
                    <td>{profile.groupNumber || "-"}</td>
                    <td>
                      <button className="action-btn edit-btn">Edit</button>
                      <button className="action-btn delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </section>
  );
};

export default AdminStudentProfilesPage;
