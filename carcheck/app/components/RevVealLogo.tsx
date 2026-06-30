type RevVealLogoProps = {
  className?: string;
  /** Compact = header size. Full = larger hero on home. */
  variant?: "compact" | "full";
};

/*
  UI 4.0 typographic wordmark. The name plays on "Rev" + "reVeal", so the
  second half is set in brass to make the pun read. Fraunces gives it the
  editorial, hand-set feel; the hairline mark separates word and tagline.
*/
export function RevVealLogo({ className = "", variant = "full" }: RevVealLogoProps) {
  if (variant === "compact") {
    return (
      <span className={`inline-flex items-baseline ${className}`}>
        <span className="font-display text-2xl sm:text-[1.7rem] font-semibold tracking-tight leading-none">
          Rev<span className="text-accent">Veal</span>
        </span>
        <span className="ml-0.5 text-accent text-2xl sm:text-[1.7rem] leading-none">.</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <span className="kicker text-accent/70">UK Vehicle Records</span>
      <span className="font-display mt-2 text-5xl sm:text-7xl font-semibold tracking-tight leading-none">
        Rev<span className="text-accent">Veal</span>
        <span className="text-accent">.</span>
      </span>
    </span>
  );
}
