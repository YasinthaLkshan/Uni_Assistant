import { GlassCard, PageHeader, SectionTitle } from "../components";

const GpaCalculatorPage = () => {
  return (
    <section className="dashboard gpa-page">
      <GlassCard className="section-entrance">
        <PageHeader
          eyebrow="Academic Performance"
          title="GPA Calculator"
          subtitle="Log your courses and grades to estimate your GPA."
        />
      </GlassCard>

      <GlassCard as="section" className="ui-section section-entrance" style={{ animationDelay: "80ms" }}>
        <SectionTitle eyebrow="Your Courses" />

        <p>
          This is a starter template for the GPA Calculator. Add inputs for course name,
          credits, and grade here, then compute your GPA based on your university&apos;s
          grading scale.
        </p>
      </GlassCard>
    </section>
  );
};

export default GpaCalculatorPage;
