const STATUS_CLASS_MAP = {
  high: "is-danger",
  medium: "is-warning",
  low: "is-success",
  danger: "is-danger",
  warning: "is-warning",
  success: "is-success",
};

const StatusBadge = ({ label, level = "low", className = "" }) => {
  const normalized = String(level).toLowerCase();
  const variantClass = STATUS_CLASS_MAP[normalized] || "";

  return <span className={`ui-badge ${variantClass} ${className}`.trim()}>{label}</span>;
};

export default StatusBadge;
