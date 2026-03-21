const SecondaryButton = ({ children, type = "button", onClick, disabled = false, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`ui-btn is-ghost ${className}`.trim()}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
