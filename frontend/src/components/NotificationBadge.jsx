import { useEffect, useRef, useState } from "react";

const NotificationBadge = ({ unreadCount = 0, className = "" }) => {
  const [isBumping, setIsBumping] = useState(false);
  const previousCountRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount !== previousCountRef.current) {
      setIsBumping(true);
      const timeoutId = setTimeout(() => setIsBumping(false), 260);
      previousCountRef.current = unreadCount;

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [unreadCount]);

  const isInactive = unreadCount === 0;

  return (
    <div
      className={`notification-badge ${isInactive ? "is-inactive" : ""} ${
        isBumping ? "is-bumping" : ""
      } ${className}`.trim()}
      aria-live="polite"
      aria-label={`Unread notifications: ${unreadCount}`}
    >
      <span className="notification-icon" aria-hidden="true">
        ●
      </span>
      <span className="notification-text">
        {isInactive ? "No new notifications" : `Unread notifications: ${unreadCount}`}
      </span>
    </div>
  );
};

export default NotificationBadge;
