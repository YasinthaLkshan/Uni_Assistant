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

const FcscInformsPage = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedEvents();
  }, []);

  const loadApprovedEvents = () => {
    const approved = localStorage.getItem("fcsc_approved_events");
    if (approved) {
      const parsedApproved = JSON.parse(approved);
      const activeApproved = parsedApproved.filter((evt) => !isApprovedEventExpired(evt.date));

      if (activeApproved.length !== parsedApproved.length) {
        localStorage.setItem("fcsc_approved_events", JSON.stringify(activeApproved));
      }

      setApprovedEvents(activeApproved);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="fcsc-informs-page">
        <div className="fcsc-loading">Loading approved events...</div>
      </section>
    );
  }

  return (
    <section className="fcsc-informs-page">
      <div className="fcsc-informs-container">
        <div className="fcsc-informs-header">
          <h1 className="fcsc-informs-title">FCSC Approved Events</h1>
          <p className="fcsc-informs-subtitle">
            View all approved FCSC events and announcements
          </p>
        </div>

        {approvedEvents.length === 0 ? (
          <div className="fcsc-informs-empty">
            <p>No approved events at the moment</p>
          </div>
        ) : (
          <div className="fcsc-informs-grid">
            {approvedEvents.map((evt) => (
              <div key={evt.id} className="fcsc-informs-card">
                <div className="fcsc-informs-card-header">
                  <h2 className="fcsc-informs-card-title">{evt.name}</h2>
                  <span className="fcsc-badge-info">{evt.title}</span>
                </div>

                <div className="fcsc-informs-card-content">
                  <p className="fcsc-informs-description">
                    {evt.description}
                  </p>

                  <div className="fcsc-informs-details">
                    <div className="fcsc-informs-detail-item">
                      <span className="fcsc-detail-label">📅 Date:</span>
                      <span className="fcsc-detail-value">
                        {new Date(evt.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="fcsc-informs-detail-item">
                      <span className="fcsc-detail-label">📍 Venue:</span>
                      <span className="fcsc-detail-value">{evt.venue}</span>
                    </div>

                    <div className="fcsc-informs-detail-item">
                      <span className="fcsc-detail-label">✓ Approved:</span>
                      <span className="fcsc-detail-value fcsc-approved-status">
                        {new Date(evt.approvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FcscInformsPage;
