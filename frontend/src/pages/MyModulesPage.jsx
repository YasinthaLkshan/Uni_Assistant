import { useEffect, useState } from "react";

import { EmptyStateCard, GlassCard, SectionTitle, StatusBadge } from "../components";
import { getMyModules } from "../services/studentAcademicService";
import { extractApiErrorMessage } from "../utils/error";

const MyModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [scope, setScope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyModules();
        setModules(response?.data?.modules || []);
        setScope(response?.data?.scope || null);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  return (
    <section className="dashboard student-academic-page">
      <GlassCard className="section-entrance">
        <p className="eyebrow">Academic</p>
        <h1 className="dashboard-title">My Modules</h1>
        <p>Modules assigned to your semester and academic group are listed below.</p>
      </GlassCard>

      {scope ? (
        <GlassCard className="ui-section section-entrance" style={{ animationDelay: "60ms" }}>
          <SectionTitle
            eyebrow="Your Scope"
            rightContent={<StatusBadge level="low" label={`Semester ${scope.semester} • Group ${scope.groupNumber}`} />}
          />
        </GlassCard>
      ) : null}

      {error ? <p className="form-error section-entrance">{error}</p> : null}

      <GlassCard className="ui-section section-entrance" style={{ animationDelay: "120ms" }}>
        <SectionTitle
          eyebrow="Module Catalog"
          rightContent={<StatusBadge level="success" label={`${modules.length} Modules`} />}
        />

        {loading ? <p>Loading modules...</p> : null}

        {!loading && !modules.length ? (
          <EmptyStateCard
            title="No modules available"
            description="Modules for your semester will appear here once configured by admin."
          />
        ) : null}

        {!loading && modules.length ? (
          <div className="student-grid-cards">
            {modules.map((module) => (
              <article key={module._id} className="student-academic-card">
                <h3>{module.moduleName}</h3>
                <p
                  className="student-academic-code"
                  title={module.moduleName}
                >
                  {module.moduleCode}
                </p>
                <p className="student-academic-meta">
                  L: {module.lectureHoursPerWeek || 0} | T: {module.tutorialHoursPerWeek || 0} | Lab: {module.labHoursPerWeek || 0}
                </p>
                {module.outline ? <p className="student-academic-note">{module.outline}</p> : null}
              </article>
            ))}
          </div>
        ) : null}
      </GlassCard>
    </section>
  );
};

export default MyModulesPage;


// Validation functions 