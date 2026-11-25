"use client";

import { useId } from "react";
import type { MotTestItem } from "@/lib/vehicle-types";
import {
  formatDate,
  mileageReadings,
  yearlyMileageReadings,
} from "@/lib/vehicle-summary";

const number = (value: number) => Math.round(value).toLocaleString("en-GB");
const change = (value: number) => `${value > 0 ? "+" : ""}${number(value)}`;

export function MileageChart({ tests }: { tests: MotTestItem[] }) {
  const id = useId();
  const points = mileageReadings(tests);
  const annual = yearlyMileageReadings(tests);
  if (!points.length)
    return (
      <div className="empty-state">
        <h3>No usable mileage records</h3>
        <p>Readings without a recognised unit are left out of the chart.</p>
      </div>
    );

  const first = points[0];
  const last = points[points.length - 1];
  const previousYear = annual[annual.length - 2];
  const max = Math.max(...annual.map((point) => point.miles), 1);
  const years = (last.time - first.time) / (365.25 * 86400000);
  const rollback = points.some(
    (point, index) => index > 0 && point.miles + 1 < points[index - 1].miles,
  );

  return (
    <>
      <div className="chart-stats">
        <div>
          <strong>
            {number(last.miles)} <span>miles</span>
          </strong>
          <span>Last MOT mileage · {formatDate(last.test.completedDate)}</span>
        </div>
        <div>
          <strong
            className={`mileage-check ${rollback ? "is-danger" : "is-success"}`}
            aria-describedby={rollback ? `${id}-note` : undefined}
          >
            {rollback ? "Review readings" : "No Mileage Alteration Detected"}
          </strong>
          <span>Comparison of all available mileage readings</span>
        </div>
        <div>
          <strong>
            {years > 0 && last.miles >= first.miles
              ? number((last.miles - first.miles) / years)
              : "—"}
          </strong>
          <span>Average miles / year between readings</span>
        </div>
        <div>
          <strong>
            {previousYear ? change(last.miles - previousYear.miles) : "—"}
          </strong>
          <span>
            {previousYear
              ? `Miles since the last record in ${previousYear.year}`
              : "Another recorded year is needed for a comparison"}
          </span>
        </div>
      </div>
      <figure className="mileage-history" aria-labelledby={id}>
        <figcaption id={id}>
          <strong>Latest odometer per year</strong>
          <span>Recorded miles</span>
        </figcaption>
        <ol>
          {annual.map((point, index) => {
            const delta =
              index > 0 ? point.miles - annual[index - 1].miles : null;
            return (
              <li key={point.year}>
                <span className="mileage-year">{point.year}</span>
                <div className="mileage-year-track" aria-hidden="true">
                  <span
                    className={`mileage-year-fill${delta !== null && delta < -1 ? " is-decrease" : ""}`}
                    style={{ width: `${(point.miles / max) * 100}%` }}
                  >
                    {delta !== null && (
                      <span className="mileage-year-change">
                        {change(delta)}
                      </span>
                    )}
                  </span>
                </div>
                <span className="mileage-year-value">
                  {number(point.miles)}
                  <span className="sr-only">
                    {` miles. ${delta === null ? "First recorded year." : `Change from the previous recorded year: ${change(delta)} miles.`}`}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </figure>
      {rollback && (
        <p id={`${id}-note`} className="small form-error">
          A recorded reading is lower than an earlier one. This can reflect an
          error or a replacement odometer; check the original records.
        </p>
      )}
    </>
  );
}
