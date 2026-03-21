const LoadingSpinner = ({ label = "Loading...", className = "" }) => {
  return (
    <div className={`loading-spinner-wrap ${className}`.trim()} role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p className="loading-spinner-label">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
