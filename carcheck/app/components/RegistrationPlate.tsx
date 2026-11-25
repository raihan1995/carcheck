import { PlateBand } from "./PlateBand";

export function RegistrationPlate({
  registration,
  compact = false,
}: {
  registration: string;
  compact?: boolean;
}) {
  const clean = registration.replace(/\s/g, "").toUpperCase();
  const display = /^[A-Z]{2}\d{2}[A-Z]{3}$/.test(clean)
    ? `${clean.slice(0, 4)} ${clean.slice(4)}`
    : clean;
  return (
    <span
      className={`registration-plate${compact ? " plate-small" : ""}`}
      aria-label={`Registration ${display}`}
    >
      <PlateBand className="plate-country" compact={compact} />
      <span>{display}</span>
    </span>
  );
}
