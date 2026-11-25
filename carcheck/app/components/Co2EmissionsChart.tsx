"use client";

import { useId } from "react";
import { co2ComparisonBand, CO2_COMPARISON_BANDS } from "@/lib/vehicle-summary";

export function Co2EmissionsChart({ emissions }: { emissions?: number }) {
  const id = useId();
  const active = co2ComparisonBand(emissions);
  if (!active)
    return (
      <div className="empty-state">
        <h3>CO₂ figure not supplied</h3>
        <p>The graph needs a recorded DVLA CO₂ figure for this vehicle.</p>
      </div>
    );

  return (
    <>
      <div className="emissions-summary">
        <p>
          <strong>{emissions}</strong> <span>g/km</span>
        </p>
        <span className="badge">DVLA recorded CO₂</span>
      </div>
      <figure className="emissions-chart" aria-labelledby={id}>
        <figcaption id={id}>
          <span>Lower CO₂</span>
          <span>Higher CO₂</span>
        </figcaption>
        <ol>
          {CO2_COMPARISON_BANDS.map((band, index) => {
            const selected = band === active;
            return (
              <li
                key={band.label}
                className={`emissions-row${selected ? " is-active" : ""}`}
              >
                <span className="emissions-range">
                  {band.range}
                  <span className="sr-only"> g/km</span>
                </span>
                <div className="emissions-track" aria-hidden="true">
                  <span
                    style={{
                      width: `${28 + index * 12}%`,
                      background: band.color,
                    }}
                  />
                </div>
                <strong className="emissions-band">{band.label}</strong>
                <span className="emissions-marker">
                  {selected ? "Your car" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </figure>
      <p className="small muted">
        Grouped A–M bands compare recorded emissions, not your tax bill or ULEZ
        status. Tax rules also depend on when the car was registered.{" "}
        <a
          href="https://www.gov.uk/vehicle-tax-rate-tables"
          className="text-link"
        >
          GOV.UK guidance
        </a>
      </p>
    </>
  );
}
