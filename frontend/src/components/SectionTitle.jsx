const SectionTitle = ({ eyebrow, title, subtitle, rightContent, className = "" }) => {
  return (
    <div className={`section-head ${className}`.trim()}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? <h3 className="section-title">{title}</h3> : null}
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {rightContent ? <div>{rightContent}</div> : null}
    </div>
  );
};

export default SectionTitle;
