import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTE_PATHS } from "../routes/routePaths";

const FCSC_AUTH_KEY = "uni_assistant_fcsc_auth";

const FcscDashboardPage = () => {
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
    
    // Combine with status
    const allEvents = [
      ...pending.map(evt => ({ ...evt, status: "pending" })),
      ...approved.map(evt => ({ ...evt, status: "approved" }))
    ];
    
    setEvents(allEvents);
  };

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
    <section className="fcsc-dashboard-page page-fade-in" aria-label="FCSC dashboard">
      <header className="fcsc-dashboard-head">
        <div className="fcsc-dashboard-head-copy">
          <p className="fcsc-eyebrow">FCSC PORTAL</p>
          <h1 className="fcsc-dashboard-title">FCSC Dashboard</h1>
        </div>
        <div className="fcsc-dashboard-head-meta">
          <button type="button" className="fcsc-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className="fcsc-dashboard-content-centered">
        <div className="fcsc-event-form-container-centered">
          <h2 className="fcsc-form-title">Create Event</h2>
          <form className="fcsc-event-form" onSubmit={handleEventSubmit}>
            <div className="fcsc-form-group">
              <label htmlFor="event-name" className="fcsc-form-label">
                Event Name
              </label>
              <input
                id="event-name"
                type="text"
                value={eventTitle}
                onChange={handleEventNameChange}
                placeholder="Enter event name (letters and numbers only, max 10)"
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
                placeholder="Enter event title (letters and numbers only, max 15)"
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
                placeholder="Enter description (letters and numbers only)"
                className="fcsc-form-input fcsc-textarea"
                rows="3"
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
                placeholder="Enter venue"
                className="fcsc-form-input"
              />
              {errors.eventVenue && (
                <p className="fcsc-form-error">{errors.eventVenue}</p>
              )}
            </div>

            <button type="submit" className="fcsc-form-submit-btn">
              Create Event
            </button>
          </form>
        </div>

        <div className="fcsc-events-list-container-centered">
          <h2 className="fcsc-form-title">Submitted Events (Pending Approval)</h2>
          {events.length === 0 ? (
            <div className="fcsc-empty-events">
              <p>No events submitted yet</p>
            </div>
          ) : (
            <div className="fcsc-events-list">
              {events.map((evt) => (
                <div key={evt.id} className={`fcsc-event-item ${evt.status === "pending" ? "fcsc-event-pending" : "fcsc-event-approved"}`}>
                  <div className="fcsc-event-status">
                    <strong>Status:</strong> 
                    <span className={`fcsc-status-badge ${evt.status === "pending" ? "status-pending" : "status-approved"}`}>
                      {evt.status === "pending" ? "Pending Approval" : "Approved"}
                    </span>
                  </div>
                  <h3 className="fcsc-event-title">{evt.name} - {evt.title}</h3>
                  <p className="fcsc-event-description">
                    <strong>Description:</strong> {evt.description}
                  </p>
                  <p className="fcsc-event-date">
                    <strong>Date:</strong> {new Date(evt.date).toLocaleDateString()}
                  </p>
                  <p className="fcsc-event-venue">
                    <strong>Venue:</strong> {evt.venue}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FcscDashboardPage;
