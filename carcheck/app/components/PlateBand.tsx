"use client";

import { useId } from "react";

type PlateBandProps = {
  className?: string;
  /** Slightly smaller band for the homepage search field */
  compact?: boolean;
};

function BritishFlagIcon({ className, clipId }: { className?: string; clipId: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden>
      <clipPath id={clipId}>
        <path d="M0,0 h60 v30 H0 z" />
      </clipPath>
      <path fill="#012169" d="M0,0 h60 v30 H0 z" />
      <path stroke="#fff" strokeWidth="6" d="M0,0 60,30 M60,0 0,30" />
      <path stroke="#C8102E" strokeWidth="4" clipPath={`url(#${clipId})`} d="M0,0 60,30 M60,0 0,30" />
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
      className={`flex shrink-0 select-none flex-col items-center justify-center rounded-[3px] bg-[#003399] text-white ${
        compact ? "px-1.5 py-1 sm:px-2" : "px-2.5 py-2"
      } ${className}`.trim()}
      aria-hidden
    >
      <BritishFlagIcon
        clipId={clipId}
        className={compact ? "mb-0.5 h-2 w-3.5 sm:h-2.5 sm:w-4" : "mb-1 h-3 w-5 sm:h-3.5 sm:w-6"}
      />
      <span className={`font-bold leading-tight ${compact ? "text-[10px] sm:text-xs" : "text-xs"}`}>
        GB
      </span>
    </span>
  );
}
