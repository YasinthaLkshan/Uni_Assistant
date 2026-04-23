import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTE_PATHS } from "../routes/routePaths";

const FCSC_AUTH_KEY = "uni_assistant_fcsc_auth";

const isApprovedEventExpired = (eventDate) => {
  if (!eventDate) {
    return false;
  }

  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  parsedDate.setHours(23, 59, 59, 999);
  return parsedDate.getTime() < Date.now();
};

const FcscDashboardPage = () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState("");
  const [eventEventTitle, setEventEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEventName = (value) => {
    return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  };

  const validateEventTitle = (value) => {
    return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15);
  };

  const validateDescription = (value) => {
    return value;
  };

  // Handle input changes with real-time validation
  const handleEventNameChange = (e) => {
    const validated = validateEventName(e.target.value);
    setEventTitle(validated);
    if (errors.eventTitle) {
      setErrors({ ...errors, eventTitle: "" });
    }
  };

  const handleEventTitleChange = (e) => {
    const validated = validateEventTitle(e.target.value);
    setEventEventTitle(validated);
    if (errors.eventEventTitle) {
      setErrors({ ...errors, eventEventTitle: "" });
    }
  };

  const handleDescriptionChange = (e) => {
    const validated = validateDescription(e.target.value);
    setEventDescription(validated);
    if (errors.eventDescription) {
      setErrors({ ...errors, eventDescription: "" });
    }
  };

  useEffect(() => {
    const isFcscLoggedIn = localStorage.getItem(FCSC_AUTH_KEY) === "true";

    if (!isFcscLoggedIn) {
      navigate(ROUTE_PATHS.login, { replace: true });
    }
  }, [navigate]);

  // Load pending and approved events from localStorage
  useEffect(() => {
    loadSubmittedEvents();
  }, []);

  const loadSubmittedEvents = () => {
    const pending = JSON.parse(localStorage.getItem("fcsc_pending_events") || "[]");
    const approved = JSON.parse(localStorage.getItem("fcsc_approved_events") || "[]");
    const activeApproved = approved.filter((evt) => !isApprovedEventExpired(evt.date));

    if (activeApproved.length !== approved.length) {
      localStorage.setItem("fcsc_approved_events", JSON.stringify(activeApproved));
    }
    
    // Combine with status
    const allEvents = [
      ...pending.map((evt) => ({ ...evt, status: "pending" })),
      ...activeApproved.map((evt) => ({ ...evt, status: "approved" }))
    ];
    
    setEvents(allEvents);
  };

  // Count stats
  const totalEvents = events.length;
  const pendingEvents = events.filter(e => e.status === "pending").length;
  const approvedEvents = events.filter(e => e.status === "approved").length;

  const handleLogout = () => {
    localStorage.removeItem(FCSC_AUTH_KEY);
    localStorage.removeItem("uni_assistant_fcsc_user");
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  const handleEventSubmit = (event) => {
    event.preventDefault();
    
    const newErrors = {};

    // Validation checks
    if (!eventTitle.trim()) {
      newErrors.eventTitle = "Event Name is required";
    }

    if (!eventEventTitle.trim()) {
      newErrors.eventEventTitle = "Event Title is required";
    }

    if (!eventDescription.trim()) {
      newErrors.eventDescription = "Description is required";
    }

    if (!eventDate) {
      newErrors.eventDate = "Date is required";
    }

    if (eventDate && eventDate < todayDate) {
      newErrors.eventDate = "Date cannot be in the past";
    }

    if (!eventVenue.trim()) {
      newErrors.eventVenue = "Venue is required";
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    // Create pending event
    const newEvent = {
      id: Date.now(),
      name: eventTitle,
      title: eventEventTitle,
      description: eventDescription,
      date: eventDate,
      venue: eventVenue,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Save to pending events in localStorage
    const pendingEvents = JSON.parse(localStorage.getItem("fcsc_pending_events") || "[]");
    pendingEvents.push(newEvent);
    localStorage.setItem("fcsc_pending_events", JSON.stringify(pendingEvents));

    // Show success message
    alert("Event submitted for admin approval!");
    
    // Reload events from localStorage
    loadSubmittedEvents();
    
    // Reset form
    setEventTitle("");
    setEventEventTitle("");
    setEventDescription("");
    setEventDate("");
    setEventVenue("");
  };

  return (
    <section className="fcsc-dash-shell page-fade-in">
      {/* Hero Welcome Card */}
      <article className="fcsc-dash-card fcsc-dash-hero">
        <p className="eyebrow">Welcome to FCSC workspace</p>
        <h1>Welcome, FCSC Administrator</h1>
        <p className="fcsc-dash-copy">
          Create and manage student events from one centralized panel. Submit events for admin approval and track their status.
        </p>

        <div className="fcsc-dash-actions">
          <button 
            type="button"
            onClick={() => document.getElementById("event-form-section").scrollIntoView({ behavior: "smooth" })}
            className="primary-btn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Create New Event
          </button>
          <button 
            type="button"
            onClick={handleLogout}
            className="fcsc-logout-btn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 9V5l-7 7 7 7v-4.1c5.547 0 10 4.432 10 9.9.022-5.468 4.528-9.9 10-9.9V16l7-7-7-7v4.1C15.463 6.032 10.985 9 10 9z" />
            </svg>
            Logout
          </button>
        </div>
      </article>

      {/* Stats Cards */}
      <div className="fcsc-stats-grid">
        <article className="fcsc-dash-card fcsc-stat-card">
          <div className="fcsc-stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <div className="fcsc-stat-content">
            <p className="fcsc-stat-label">Total Events</p>
            <p className="fcsc-stat-number">{totalEvents}</p>
          </div>
        </article>

        <article className="fcsc-dash-card fcsc-stat-card">
          <div className="fcsc-stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <div className="fcsc-stat-content">
            <p className="fcsc-stat-label">Pending Approval</p>
            <p className="fcsc-stat-number">{pendingEvents}</p>
          </div>
        </article>

        <article className="fcsc-dash-card fcsc-stat-card">
          <div className="fcsc-stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="fcsc-stat-content">
            <p className="fcsc-stat-label">Approved Events</p>
            <p className="fcsc-stat-number">{approvedEvents}</p>
          </div>
        </article>
      </div>

      {/* Two Column Layout */}
      <div className="fcsc-content-grid">
        {/* Left: Create Event Form */}
        <article className="fcsc-dash-card fcsc-form-section" id="event-form-section">
          <div className="fcsc-section-header">
            <p className="eyebrow">Create & Submit</p>
            <h3>New Event</h3>
          </div>

          <form className="fcsc-event-form-modern" onSubmit={handleEventSubmit}>
            <div className="fcsc-form-group">
              <label htmlFor="event-name" className="fcsc-form-label">
                Event Name
              </label>
              <input
                id="event-name"
                type="text"
                value={eventTitle}
                onChange={handleEventNameChange}
                placeholder="e.g., Tech Seminar"
                className="fcsc-form-input"
              />
              {errors.eventTitle && (
                <p className="fcsc-form-error">{errors.eventTitle}</p>
              )}
              <p className="fcsc-char-count">{eventTitle.length}/10</p>
            </div>

            <div className="fcsc-form-group">
              <label htmlFor="event-title" className="fcsc-form-label">
                Event Title
              </label>
              <input
                id="event-title"
                type="text"
                value={eventEventTitle}
                onChange={handleEventTitleChange}
                placeholder="e.g., AI Workshop"
                className="fcsc-form-input"
              />
              {errors.eventEventTitle && (
                <p className="fcsc-form-error">{errors.eventEventTitle}</p>
              )}
              <p className="fcsc-char-count">{eventEventTitle.length}/15</p>
            </div>

            <div className="fcsc-form-group">
              <label htmlFor="event-description" className="fcsc-form-label">
                Description
              </label>
              <textarea
                id="event-description"
                value={eventDescription}
                onChange={handleDescriptionChange}
                placeholder="Describe the event and its purpose..."
                className="fcsc-form-input fcsc-textarea"
                rows="4"
              />
              {errors.eventDescription && (
                <p className="fcsc-form-error">{errors.eventDescription}</p>
              )}
            </div>

            <div className="fcsc-form-group">
              <label htmlFor="event-date" className="fcsc-form-label">
                Date
              </label>
              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={todayDate}
                className="fcsc-form-input"
              />
              {errors.eventDate && (
                <p className="fcsc-form-error">{errors.eventDate}</p>
              )}
            </div>

            <div className="fcsc-form-group">
              <label htmlFor="event-venue" className="fcsc-form-label">
                Venue
              </label>
              <input
                id="event-venue"
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                placeholder="e.g., Main Hall, Room 101"
                className="fcsc-form-input"
              />
              {errors.eventVenue && (
                <p className="fcsc-form-error">{errors.eventVenue}</p>
              )}
            </div>

            <button type="submit" className="fcsc-form-submit-btn primary-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Submit Event
            </button>
          </form>
        </article>

        {/* Right: Events List */}
        <article className="fcsc-dash-card fcsc-events-section">
          <div className="fcsc-section-header">
            <p className="eyebrow">Event Submissions</p>
            <h3>All Events</h3>
          </div>

          {events.length === 0 ? (
            <div className="fcsc-empty-state">
              <svg viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              <p>No events submitted yet</p>
              <span>Create your first event to get started</span>
            </div>
          ) : (
            <div className="fcsc-events-list">
              {events.map((evt) => (
                <div key={evt.id} className={`fcsc-event-item fcsc-event-${evt.status}`}>
                  <div className="fcsc-event-header">
                    <div className="fcsc-event-meta">
                      <h4>{evt.name}</h4>
                      <p>{evt.title}</p>
                    </div>
                    <span className={`fcsc-status-badge fcsc-badge-${evt.status}`}>
                      {evt.status === "pending" ? "⏳ Pending" : "✓ Approved"}
                    </span>
                  </div>
                  
                  <div className="fcsc-event-details">
                    <div className="fcsc-event-detail-row">
                      <svg viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                      </svg>
                      <span>{new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                    <div className="fcsc-event-detail-row">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span>{evt.venue}</span>
                    </div>
                  </div>

                  <p className="fcsc-event-description-text">{evt.description}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default FcscDashboardPage;
