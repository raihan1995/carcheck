/** RevVeal logo: speedometer arc + orange checkmark + motion lines, REV (black) + VEAL (orange). */

type RevVealLogoProps = {
  className?: string;
  /** Compact = icon + wordmark in one line (for header). Full = stacked graphic above text (for home). */
  variant?: "compact" | "full";
};

export function RevVealLogo({ className = "", variant = "full" }: RevVealLogoProps) {
  if (variant === "compact") {
    return (
      <svg
        viewBox="0 0 140 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        {/* Speedometer arc */}
        <path
          d="M8 22 A 10 10 0 0 1 24 22"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="text-slate-900"
        />
        <circle cx="9" cy="20" r="1" fill="currentColor" className="text-slate-900" />
        <circle cx="14" cy="16" r="1" fill="currentColor" className="text-slate-900" />
        <circle cx="20" cy="16" r="1" fill="currentColor" className="text-slate-900" />
        <circle cx="23" cy="20" r="1" fill="currentColor" className="text-slate-900" />
        {/* Checkmark */}
        <defs>
          <linearGradient id="checkCompact" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path
          d="M11 18 L15 22 L26 10"
          stroke="url(#checkCompact)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Motion lines */}
        <line x1="28" y1="12" x2="32" y2="12" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        <line x1="29" y1="15" x2="34" y2="15" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        {/* REV (black) + VEAL (orange) */}
        <text x="38" y="22" fontSize="14" fontWeight="700" letterSpacing="0.08em" fontFamily="system-ui, sans-serif">
          <tspan fill="#0f172a">REV</tspan>
          <tspan fill="#f59e0b">VEAL</tspan>
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 160 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Speedometer arc */}
      <path
        d="M 32 38 A 28 28 0 0 1 128 38"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="36" cy="34" r="2.5" fill="#0f172a" />
      <circle cx="52" cy="24" r="2.5" fill="#0f172a" />
      <circle cx="80" cy="20" r="2.5" fill="#0f172a" />
      <circle cx="108" cy="24" r="2.5" fill="#0f172a" />
      <circle cx="124" cy="34" r="2.5" fill="#0f172a" />
      {/* Orange checkmark */}
      <path
        d="M 50 32 L 72 52 L 118 18"
        stroke="url(#checkGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Motion lines */}
      <line x1="122" y1="22" x2="138" y2="22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <line x1="126" y1="28" x2="145" y2="28" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="124" y1="34" x2="140" y2="34" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* REV (black) + VEAL (orange) */}
      <text x="80" y="64" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="0.15em" fontFamily="system-ui, sans-serif">
        <tspan fill="#0f172a">REV</tspan>
        <tspan fill="#f59e0b">VEAL</tspan>
      </text>
    </svg>
  );
}
