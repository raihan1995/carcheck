import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrationPlate } from "@/app/components/RegistrationPlate";
import { PrintReportButton } from "@/app/components/PrintReportButton";
import { ReloadButton } from "@/app/components/ReloadButton";
import { Icon } from "@/app/components/ui/Icon";
import { formatDate } from "@/lib/vehicle-summary";

export const metadata = {
  title: "Full vehicle report",
  robots: { index: false, follow: false },
};
const checks = [
  {
    key: "stolen",
    title: "Stolen vehicle records",
    description: "Recorded stolen status from the full-report provider.",
  },
  {
    key: "finance",
    title: "Outstanding finance",
    description: "Recorded finance agreements associated with the vehicle.",
  },
  {
    key: "writeOff",
    title: "Insurance write-off",
    description: "Recorded insurance write-off categories and dates.",
  },
  {
    key: "mileage",
    title: "Mileage analysis",
    description:
      "Mileage discrepancies identified by the full-report provider.",
  },
  {
    key: "plateChanges",
    title: "Plate changes",
    description: "Recorded registration changes.",
  },
  {
    key: "valuation",
    title: "Vehicle valuation",
    description:
      "An estimate from the valuation provider, with its stated assumptions.",
  },
];
type Check = {
  status: "clear" | "attention" | "not_checked";
  summary: string;
  source: string;
  updatedAt?: string;
};
function readCheck(raw: unknown): Check {
  const value =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const status =
    value.status === "clear" || value.status === "attention"
      ? value.status
      : "not_checked";
  return {
    status,
    summary:
      typeof value.summary === "string"
        ? value.summary
        : "No result is available for this section. Do not interpret this as a clear check.",
    source:
      typeof value.source === "string"
        ? value.source
        : "[PLACEHOLDER] Provider source not supplied",
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}
export default async function PaidReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sample = id.toUpperCase() === "SAMPLE";
  let registration = "SAMPLE";
  let purchasedAt = "";
  let reportData: Record<string, unknown> = {};
  let loadError = false;
  if (!sample) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      notFound();
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) redirect(`/login?next=${encodeURIComponent(`/report/${id}`)}`);
    const { data, error } = await client
      .from("vehicle_reports")
      .select("registration,report_data,purchased_at,status")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) loadError = true;
    else if (!data || data.status !== "completed") notFound();
    else {
      registration = data.registration;
      purchasedAt = data.purchased_at;
      reportData = data.report_data || {};
    }
  }
  if (loadError)
    return (
      <div className="container section">
        <div className="card empty-state">
          <Icon name="info" size={28} />
          <h1 style={{ fontSize: "var(--text-28)" }}>
            Report temporarily unavailable
          </h1>
          <p role="alert">
            We could not load the stored report. Please try again.
          </p>
          <ReloadButton />
        </div>
      </div>
    );
  return (
    <article className="report-page">
      <div className="container">
        <header className="page-heading">
          <div className="breadcrumbs no-print">
            <Link href={sample ? "/vehicle/SAMPLE" : "/dashboard/reports"}>
              {sample ? "Free sample" : "Your reports"}
            </Link>
            <Icon name="chevron" size={14} />
            <span>Full report</span>
          </div>
          <div className="page-heading-row">
            <div>
              <div className="report-title-row">
                <RegistrationPlate registration={registration} />
                <span className="badge">
                  {sample ? "Illustrative sample" : "Purchased report"}
                </span>
              </div>
              <h1>
                {sample
                  ? "What a full report looks like"
                  : "Your stored vehicle report"}
              </h1>
              <p className="muted small">
                {sample
                  ? "Example content only. No live paid check has been performed."
                  : `Purchased ${formatDate(purchasedAt)} · Stored snapshot`}
              </p>
            </div>
            <PrintReportButton />
          </div>
        </header>
        {sample && (
          <div className="notice" style={{ marginBottom: 32 }}>
            <Icon name="info" />
            <p>
              Every result below is illustrative. This is a design sample, not
              evidence about a real vehicle. Paid reports are in preparation at
              £5.99 incl. VAT.
            </p>
          </div>
        )}
        <div className="report-layout">
          <div className="stack">
            {checks.map((check, index) => {
              const result: Check = sample
                ? {
                    status:
                      index === 3
                        ? "attention"
                        : index === 5
                          ? "not_checked"
                          : "clear",
                    summary:
                      index === 3
                        ? "Example: one reading needs clarification. The report would identify the date, unit and comparison here."
                        : index === 5
                          ? "[PLACEHOLDER] A provider valuation and its assumptions would appear here."
                          : `Example only: no ${index === 0 ? "stolen marker" : index === 1 ? "outstanding finance agreement" : index === 2 ? "insurance write-off" : "registration change"} in this illustrative record.`,
                    source: "Illustrative sample data",
                    updatedAt: undefined,
                  }
                : readCheck(reportData[check.key]);
              return (
                <section className="card" key={check.key} id={check.key}>
                  <div className="card-heading">
                    <h2>{check.title}</h2>
                    <span
                      className={`status-label ${result.status === "clear" ? "is-success" : result.status === "attention" ? "is-danger" : ""}`}
                    >
                      <Icon
                        name={
                          result.status === "clear"
                            ? "check"
                            : result.status === "attention"
                              ? "alert"
                              : "info"
                        }
                        size={18}
                      />
                      {result.status === "clear"
                        ? "No record found"
                        : result.status === "attention"
                          ? "Attention"
                          : "Not checked"}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="small muted">{check.description}</p>
                    <p>{result.summary}</p>
                    <p className="small muted" style={{ marginBottom: 0 }}>
                      Source: {result.source}
                      <br />
                      Last updated:{" "}
                      {result.updatedAt
                        ? formatDate(result.updatedAt)
                        : sample
                          ? "Fixed sample · not live"
                          : "[PLACEHOLDER] Source timestamp not supplied"}
                    </p>
                  </div>
                </section>
              );
            })}
            <div className="notice">
              <Icon name="info" />
              <p>
                A report records the information available from its sources at
                the stated time. Missing data is not a clear result. RevVeal is
                independent and is not affiliated with the DVLA or DVSA.
              </p>
            </div>
          </div>
          <aside className="report-sidebar no-print">
            <div className="card card-body">
              <span className="eyebrow">In this report</span>
              <nav className="article-nav" aria-label="Report contents">
                {checks.map((check) => (
                  <a href={`#${check.key}`} key={check.key}>
                    {check.title}
                  </a>
                ))}
              </nav>
              <p className="small muted" style={{ marginTop: 24 }}>
                Use “Save as PDF” to open your browser’s print options, then
                choose Save as PDF.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
