const GlassCard = ({ as: Component = "section", className = "", children, style }) => {
  return (
    <Component className={`ui-card glass-card ${className}`.trim()} style={style}>
      {children}
    </Component>
  );
};

export default GlassCard;
