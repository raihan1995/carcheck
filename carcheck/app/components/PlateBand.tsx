"use client";

import { useId } from "react";

type PlateBandProps = {
  className?: string;
  /** Slightly smaller band for the homepage search field */
  compact?: boolean;
};

function BritishFlagIcon({
  className,
  clipId,
}: {
  className?: string;
  clipId: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 30"
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id={clipId}>
        <path d="M0,0 h60 v30 H0 z" />
      </clipPath>
      <path fill="#012169" d="M0,0 h60 v30 H0 z" />
      <path stroke="#fff" strokeWidth="6" d="M0,0 60,30 M60,0 0,30" />
      <path
        stroke="#C8102E"
        strokeWidth="4"
        clipPath={`url(#${clipId})`}
        d="M0,0 60,30 M60,0 0,30"
      />
      <path stroke="#fff" strokeWidth="10" d="M30,0 v30 M0,15 h60" />
      <path stroke="#C8102E" strokeWidth="6" d="M30,0 v30 M0,15 h60" />
    </svg>
  );
}

/** Blue plate band with Union Jack and GB (Great Britain) identifier. */
export function PlateBand({ className = "", compact = false }: PlateBandProps) {
  const clipId = useId().replace(/:/g, "");

  return (
    <span
      className={`plate-band${compact ? " plate-band-compact" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <BritishFlagIcon clipId={clipId} />
      <span>GB</span>
    </span>
  );
}
