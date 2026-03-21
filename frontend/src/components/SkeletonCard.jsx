const SkeletonCard = ({ lines = 3, className = "" }) => {
  const safeLines = Math.max(1, Math.min(lines, 6));

  return (
    <article className={`skeleton-card ${className}`.trim()} aria-hidden="true">
      <span className="skeleton-block skeleton-title" />
      <div className="skeleton-lines">
        {Array.from({ length: safeLines }).map((_, index) => (
          <span
            key={`skeleton-line-${index + 1}`}
            className={`skeleton-block skeleton-line ${index === safeLines - 1 ? "is-short" : ""}`.trim()}
          />
        ))}
      </div>
    </article>
  );
};

export default SkeletonCard;