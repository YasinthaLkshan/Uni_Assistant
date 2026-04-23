import { useEffect, useState } from "react";

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

const AdminFcscInformsPage = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);

  useEffect(() => {
    // Load events from localStorage
    loadEvents();
  }, []);

  const loadEvents = () => {
    const stored = localStorage.getItem("fcsc_pending_events");
    const approved = localStorage.getItem("fcsc_approved_events");
    
    if (stored) {
      setPendingEvents(JSON.parse(stored));
    }
    if (approved) {
      const parsedApproved = JSON.parse(approved);
      const activeApproved = parsedApproved.filter((evt) => !isApprovedEventExpired(evt.date));

      if (activeApproved.length !== parsedApproved.length) {
        localStorage.setItem("fcsc_approved_events", JSON.stringify(activeApproved));
      }

      setApprovedEvents(activeApproved);
    }
  };

  const handleApproveEvent = (eventId) => {
    const eventToApprove = pendingEvents.find((evt) => evt.id === eventId);
    
    if (eventToApprove) {
      // Remove from pending
      const updatedPending = pendingEvents.filter((evt) => evt.id !== eventId);
      setPendingEvents(updatedPending);
      localStorage.setItem("fcsc_pending_events", JSON.stringify(updatedPending));

      // Add to approved
      const updatedApproved = [...approvedEvents, { ...eventToApprove, approvedAt: new Date().toISOString() }];
      const activeApproved = updatedApproved.filter((evt) => !isApprovedEventExpired(evt.date));

      setApprovedEvents(activeApproved);
      localStorage.setItem("fcsc_approved_events", JSON.stringify(activeApproved));
    }
  };

  const handleRejectEvent = (eventId) => {
    const updatedPending = pendingEvents.filter((evt) => evt.id !== eventId);
    setPendingEvents(updatedPending);
    localStorage.setItem("fcsc_pending_events", JSON.stringify(updatedPending));
  };

  return (
    <div className="admin-fcsc-informs-page">
      {/* Pending Events Section */}
      <section className="fcsc-section">
        <h2 className="fcsc-section-title">Pending Approval ({pendingEvents.length})</h2>
        
        {pendingEvents.length === 0 ? (
          <div className="fcsc-empty-state">
            <p>No pending events for approval</p>
          </div>
        ) : (
          <div className="fcsc-events-grid">
            {pendingEvents.map((evt) => (
              <div key={evt.id} className="fcsc-event-card">
                <div className="fcsc-event-card-header">
                  <h3 className="fcsc-event-card-title">{evt.name} - {evt.title}</h3>
                  <span className="fcsc-badge-pending">Pending</span>
                </div>
                
                <div className="fcsc-event-card-body">
                  <p className="fcsc-event-detail">
                    <strong>Description:</strong> {evt.description}
                  </p>
                  <p className="fcsc-event-detail">
                    <strong>Date:</strong> {new Date(evt.date).toLocaleDateString()}
                  </p>
                  <p className="fcsc-event-detail">
                    <strong>Venue:</strong> {evt.venue}
                  </p>
                </div>

                <div className="fcsc-event-card-actions">
                  <button
                    type="button"
                    className="fcsc-btn fcsc-btn-approve"
                    onClick={() => handleApproveEvent(evt.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="fcsc-btn fcsc-btn-reject"
                    onClick={() => handleRejectEvent(evt.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Events Section */}
      <section className="fcsc-section">
        <h2 className="fcsc-section-title">Approved Events ({approvedEvents.length})</h2>
        
        {approvedEvents.length === 0 ? (
          <div className="fcsc-empty-state">
            <p>No approved events yet</p>
          </div>
        ) : (
          <div className="fcsc-events-grid">
            {approvedEvents.map((evt) => (
              <div key={evt.id} className="fcsc-event-card fcsc-event-card-approved">
                <div className="fcsc-event-card-header">
                  <h3 className="fcsc-event-card-title">{evt.name} - {evt.title}</h3>
                  <span className="fcsc-badge-approved">Approved</span>
                </div>
                
                <div className="fcsc-event-card-body">
                  <p className="fcsc-event-detail">
                    <strong>Description:</strong> {evt.description}
                  </p>
                  <p className="fcsc-event-detail">
                    <strong>Date:</strong> {new Date(evt.date).toLocaleDateString()}
                  </p>
                  <p className="fcsc-event-detail">
                    <strong>Venue:</strong> {evt.venue}
                  </p>
                  <p className="fcsc-event-detail fcsc-approved-date">
                    <strong>Approved:</strong> {new Date(evt.approvedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminFcscInformsPage;
