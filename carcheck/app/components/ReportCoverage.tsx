import Link from "next/link";
import { FULL_REPORT_PRICE } from "@/lib/site";
import { Icon, type IconName } from "./ui/Icon";

type CoverageCategory = {
  title: string;
  summary: string;
  icon: IconName;
  availability: string;
  features: { label: string; note?: string }[];
};

const categories: CoverageCategory[] = [
  {
    title: "Risk checks",
    summary: "Stolen, finance, write-off",
    icon: "shield",
    availability: "Full report · planned",
    features: [
      { label: "Stolen vehicle check" },
      { label: "Outstanding finance" },
      { label: "Write-off history (Cat S/N/C/D)" },
    ],
  },
  {
    title: "MOT history",
    summary: "Every test, every advisory",
    icon: "file",
    availability: "Free + planned extras",
    features: [
      { label: "Complete test history" },
      { label: "Pass/fail results" },
      { label: "Advisories & repeat faults" },
      { label: "Outstanding safety recalls", note: "Planned full report" },
    ],
  },
  {
    title: "Mileage",
    summary: "Timeline and anomaly checks",
    icon: "chart",
    availability: "Free + planned analysis",
    features: [
      { label: "Full mileage timeline" },
      { label: "Clocking / anomaly detection", note: "Planned full report" },
      { label: "Cross-checked against MOT records" },
    ],
  },
  {
    title: "Ownership",
    summary: "Keepers and logbooks",
    icon: "users",
    availability: "Full report · planned",
    features: [
      { label: "Previous keeper count" },
      { label: "Keeper change dates" },
      { label: "Plate changes" },
    ],
  },
  {
    title: "Vehicle spec",
    summary: "Engine to kerb weight",
    icon: "gauge",
    availability: "Free + sign-in",
    features: [
      { label: "Engine, fuel & CO₂" },
      { label: "Dimensions & kerb weight", note: "Sign-in · catalogue match" },
      {
        label: "Seating & fuel tank capacity",
        note: "Sign-in · catalogue match",
      },
    ],
  },
  {
    title: "Status & value",
    summary: "Scrapped, imported, value",
    icon: "tag",
    availability: "Full report · planned",
    features: [
      { label: "Imported or exported" },
      { label: "Scrapped & Certificate of Destruction" },
      { label: "Vehicle valuation" },
    ],
  },
];

export function ReportCoverage() {
  return (
    <section
      className="card report-coverage"
      id="report-coverage"
      aria-labelledby="report-coverage-heading"
    >
      <div className="card-body">
        <span className="eyebrow">Your report</span>
        <h2 id="report-coverage-heading">
          What the free records cannot tell you
        </h2>
        <p className="report-coverage-intro">
          See what’s included now and what the planned full report adds.
        </p>
        <div className="report-coverage-grid">
          {categories.map((category) => (
            <article className="report-coverage-card" key={category.title}>
              <Icon
                name={category.icon}
                size={36}
                className="report-coverage-icon"
              />
              <h3>{category.title}</h3>
              <p className="report-coverage-summary">{category.summary}</p>
              <span className="report-coverage-availability">
                {category.availability}
              </span>
              <ul>
                {category.features.map((feature) => (
                  <li key={feature.label}>
                    {feature.label}
                    {feature.note && <small>{feature.note}</small>}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="report-coverage-note">
          Paid checks and checkout are not yet available. Items marked planned
          have not been checked for this vehicle.
        </p>
        <Link href="/pricing" className="text-link">
          Read about the {FULL_REPORT_PRICE} full report
        </Link>
      </div>
    </section>
  );
}
