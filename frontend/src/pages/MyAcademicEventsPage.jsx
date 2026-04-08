import { useEffect, useMemo, useState } from "react";

import { EmptyStateCard, GlassCard, SectionTitle, StatusBadge } from "../components";
import { getMyEvents } from "../services/studentAcademicService";
import { extractApiErrorMessage } from "../utils/error";

const getDaysUntilEvent = (value) => {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(value);
  if (Number.isNaN(eventDate.getTime())) return null;
  eventDate.setHours(0, 0, 0, 0);

  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.round((eventDate.getTime() - today.getTime()) / dayInMs);
};

const getUpcomingCategory = (value) => {
  const daysUntilEvent = getDaysUntilEvent(value);

  if (daysUntilEvent === null || daysUntilEvent < 1 || daysUntilEvent > 7) {
    return null;
  }

  if (daysUntilEvent <= 3) {
    return {
      level: "danger",
      label: `${daysUntilEvent} ${daysUntilEvent === 1 ? "day" : "days"} left`,
      cardClass: "is-imminent-card",
    };
  }

  if (daysUntilEvent <= 5) {
    return {
      level: "warning",
      label: `${daysUntilEvent} ${daysUntilEvent === 1 ? "day" : "days"} left`,
      cardClass: "is-near-card",
    };
  }

  return {
    level: "success",
    label: `${daysUntilEvent} ${daysUntilEvent === 1 ? "day" : "days"} left`,
    cardClass: "is-soon-card",
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString();
};

const MyAcademicEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [scope, setScope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter out past events - only show future/upcoming events
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  }, [events]);

  const upcomingCount = useMemo(() => upcomingEvents.filter((event) => getUpcomingCategory(event.eventDate)).length, [upcomingEvents]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyEvents();
        setEvents(response?.data?.events || []);
        setScope(response?.data?.scope || null);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <section className="dashboard student-academic-page">
      <GlassCard className="section-entrance">
        <p className="eyebrow">Academic</p>
        <h1 className="dashboard-title">My Academic Events</h1>
        <p>Track assessments and important academic milestones for your group.</p>
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
          eyebrow="Event Timeline"
          rightContent={<StatusBadge level={upcomingCount ? "warning" : "success"} label={`${upcomingCount} Upcoming`} />}
        />

        {loading ? <p>Loading events...</p> : null}

        {!loading && !events.length ? (
          <EmptyStateCard
            title="No academic events"
            description="Events will appear here once your lecturers publish them."
          />
        ) : null}

        {!loading && events.length && !upcomingEvents.length ? (
          <EmptyStateCard
            title="No upcoming events"
            description="All your academic events have already passed."
          />
        ) : null}

        {!loading && upcomingEvents.length ? (
          <div className="student-grid-cards">
            {upcomingEvents.map((event) => {
              const upcomingCategory = getUpcomingCategory(event.eventDate);
              return (
                <article
                  key={event._id}
                  className={`student-academic-card ${upcomingCategory?.cardClass || ""}`.trim()}
                >
                  <div className="student-card-head">
                    <h3>{event.title}</h3>
                    {upcomingCategory ? <StatusBadge level={upcomingCategory.level} label={upcomingCategory.label} /> : null}
                  </div>
                  <p className="student-academic-meta">{event.eventType} • {formatDate(event.eventDate)}</p>
                  <p className="student-academic-meta">{event.moduleCode} {event.moduleName ? `- ${event.moduleName}` : ""}</p>
                  <p className="student-academic-meta">{event.startTime || "--:--"}{event.endTime ? ` - ${event.endTime}` : ""}</p>
                  {event.description ? <p className="student-academic-note">{event.description}</p> : null}
                  <p className="student-academic-meta">Venue: {event.venue || "TBA"} • Weight: {event.weightPercentage ?? 0}%</p>
                </article>
              );
            })}
          </div>
        ) : null}
      </GlassCard>
    </section>
  );
};

export default MyAcademicEventsPage;
