type RevVealLogoProps = {
  className?: string;
  /** Compact = header size. Full = larger hero on home. */
  variant?: "compact" | "full";
};

const variantHeights: Record<NonNullable<RevVealLogoProps["variant"]>, string> = {
  compact: "h-9 w-auto sm:h-10",
  full: "h-28 w-auto sm:h-36 md:h-44",
};

export function RevVealLogo({ className = "", variant = "full" }: RevVealLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/img/revveal.png"
      alt="RevVeal"
      className={`${className || variantHeights[variant]} object-contain`.trim()}
    />
  );
}
