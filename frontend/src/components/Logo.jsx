const Logo = ({ variant = "default", className = "" }) => {
  return (
    <div className={`logo-container ${variant} ${className}`.trim()}>
      <svg
        className="logo-icon"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Graduation cap and academic theme */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Outer circle background */}
        <circle cx="20" cy="20" r="19" fill="url(#logoGradient)" opacity="0.1" stroke="url(#logoGradient)" strokeWidth="1.5" />

        {/* Graduation cap */}
        <g transform="translate(20, 18)">
          {/* Cap board */}
          <rect x="-10" y="-2" width="20" height="2.5" rx="0.5" fill="url(#logoGradient)" />

          {/* Tassel */}
          <line x1="0" y1="0.5" x2="0" y2="7" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="8" r="1.2" fill="url(#logoGradient)" />

          {/* Cap top triangle */}
          <polygon points="0,-8 -8,-2 8,-2" fill="url(#logoGradient)" />
        </g>

        {/* Book/academic element at bottom */}
        <g transform="translate(20, 27)">
          <rect x="-7" y="-3" width="14" height="5" rx="1" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" />
          <line x1="-7" y1="0" x2="7" y2="0" stroke="url(#logoGradient)" strokeWidth="1" opacity="0.6" />
        </g>
      </svg>

      <span className="logo-text">Uni Assistant</span>
    </div>
  );
};

export default Logo;
