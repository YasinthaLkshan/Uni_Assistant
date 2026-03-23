const PageHeader = ({ eyebrow, title, subtitle, rightContent, className = "" }) => {
  return (
    <header className={`dashboard-head ${className}`.trim()}>
      <div className="dashboard-head-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="dashboard-title">{title}</h1>
        {subtitle ? <p className="dashboard-subtitle">{subtitle}</p> : null}
      </div>
      {rightContent ? <div className="dashboard-head-meta">{rightContent}</div> : null}
    </header>
  );
};

export default PageHeader;
