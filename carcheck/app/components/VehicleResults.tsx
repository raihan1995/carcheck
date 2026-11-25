"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VehicleCheckResult } from "@/lib/vehicle-types";
import {
  formatDate,
  motSummary,
  taxSummary,
  ulezSummary,
  testTime,
  motDefectCategory,
  type SummaryStatus,
} from "@/lib/vehicle-summary";
import { recordCheck } from "@/lib/browser-garage";
import { Icon } from "./ui/Icon";
import { RegistrationPlate } from "./RegistrationPlate";
import { RegistrationSearch } from "./RegistrationSearch";
import { SaveCarButton } from "./SaveCarButton";
import { MileageChart } from "./MileageChart";
import { Co2EmissionsChart } from "./Co2EmissionsChart";
import { PrintReportButton } from "./PrintReportButton";
import { ReportUpsell } from "./ReportUpsell";

function StatusCard({
  title,
  status,
  verification,
}: {
  title: string;
  status: SummaryStatus;
  verification?: { href: string; label: string };
}) {
  return (
    <section
      className={`status-card status-${status.state}`}
      aria-label={`${title}: ${status.label}`}
    >
      <span>{title}</span>
      <strong>
        <Icon
          name={
            status.state === "success"
              ? "check"
              : status.state === "danger"
                ? "alert"
                : "info"
          }
          size={18}
        />
        {status.label}
      </strong>
      <p>
        {status.detail}
        {verification && (
          <>
            {" · "}
            <a
              href={verification.href}
              target="_blank"
              rel="noopener noreferrer"
              className="status-verification"
            >
              {verification.label}
            </a>
          </>
        )}
      </p>
    </section>
  );
}
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value == null || value === "" ? "Not supplied" : value}</dd>
    </div>
  );
}
export function VehicleResults({ registration }: { registration: string }) {
  const [data, setData] = useState<VehicleCheckResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [specId, setSpecId] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve()
      .then(async () => {
        setLoading(true);
        setError("");
        const res = await fetch(
          `/api/check?registration=${encodeURIComponent(registration)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const json = await res.json();
        if (!res.ok || json.demo)
          throw new Error(
            json.error ||
              "Vehicle information is not available right now. Please try again.",
          );
        if (
          !json.vehicle?.registrationNumber ||
          !Array.isArray(json.specCandidates)
        )
          throw new Error(
            "We could not read the vehicle record. Please try again.",
          );
        if (controller.signal.aborted) return;
        setData(json);
        setSpecId(json.suggestedSpecId || json.specCandidates[0]?.id || "");
        if (!json.sample) {
          try {
            recordCheck({
              registration: json.vehicle.registrationNumber,
              make: json.vehicle.make,
              model: json.motHistory?.[0]?.model,
            });
          } catch {
            /* Lookup remains usable without browser storage. */
          }
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error
              ? err.message
              : "The check could not be completed. Please try again.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [registration, attempt]);
  if (loading)
    return (
      <div className="report-page">
        <div className="container section" role="status" aria-live="polite">
          <span className="eyebrow">Vehicle check</span>
          <h1 style={{ fontSize: "var(--text-40)" }}>Reading the records…</h1>
          <p className="muted">
            Checking the available DVLA and MOT information.
          </p>
          <div
            className="loading-shimmer"
            style={{ height: 8, maxWidth: 480, marginTop: 32 }}
          />
        </div>
      </div>
    );
  if (error || !data)
    return (
      <div className="container section">
        <div className="card empty-state">
          <Icon name="info" size={32} />
          <h1 style={{ fontSize: "var(--text-28)" }}>
            We could not complete this check
          </h1>
          <p role="alert">{error || "No vehicle information was returned."}</p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <button
              className="button button-primary"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Try again
            </button>
            <Link href="/" className="button button-secondary">
              Check another registration
            </Link>
            <Link href="/vehicle/SAMPLE" className="text-link">
              View the sample
            </Link>
          </div>
        </div>
      </div>
    );
  const { vehicle, motHistory, sample, specCandidates, performanceUnlocked } =
    data;
  const primary = motHistory?.[0];
  const tests = [...(primary?.motTests || [])].sort(
    (a, b) => testTime(b) - testTime(a),
  );
  const selected = specCandidates.find((c) => c.id === specId);
  const defects = tests.flatMap((t) => t.rfrAndComments || t.defects || []);
  const passedTests = tests.filter(
    (test) => test.testResult?.trim().toUpperCase() === "PASSED",
  ).length;
  const failedTests = tests.filter(
    (test) => test.testResult?.trim().toUpperCase() === "FAILED",
  ).length;
  const otherTests = tests.length - passedTests - failedTests;
  const passRate = tests.length
    ? Math.round((passedTests / tests.length) * 100)
    : null;
  const title = [vehicle.yearOfManufacture, vehicle.make, primary?.model]
    .filter(Boolean)
    .join(" ");
  const updated = data.retrievedAt
    ? new Date(data.retrievedAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/London",
      })
    : "Not supplied";
  return (
    <div className="report-page">
      <div className="container">
        <div className="page-heading">
          <div className="breadcrumbs no-print">
            <Link href="/">Vehicle check</Link>
            <Icon name="chevron" size={14} />
            <span>{sample ? "Sample report" : "Free results"}</span>
          </div>
          <div className="page-heading-row">
            <div>
              <div className="report-title-row">
                <RegistrationPlate registration={vehicle.registrationNumber} />
                {sample && <span className="badge">Sample data</span>}
              </div>
              <h1>{title || "Vehicle information"}</h1>
              <div className="report-meta">
                <span>
                  {[
                    vehicle.colour,
                    vehicle.fuelType,
                    vehicle.engineCapacity
                      ? `${(vehicle.engineCapacity / 1000).toFixed(1)} litre`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {sample && <span>Illustrative record · not a live check</span>}
              </div>
            </div>
            <div className="button-row no-print">
              {!sample && (
                <SaveCarButton
                  registration={vehicle.registrationNumber}
                  make={vehicle.make}
                  model={primary?.model}
                />
              )}
              <PrintReportButton />
            </div>
          </div>
        </div>
        {sample && (
          <div className="notice">
            <Icon name="info" />
            <p>
              This is an illustrative sample, not the history of a real vehicle.
              Dates and readings are fixed examples.{" "}
              <Link href="/report/SAMPLE" className="text-link">
                See the full report layout
              </Link>
              .
            </p>
          </div>
        )}
        <div className="status-strip">
          <StatusCard title="MOT status" status={motSummary(vehicle)} />
          <StatusCard title="Vehicle tax" status={taxSummary(vehicle)} />
          <StatusCard
            title="London ULEZ estimate"
            status={data.ulezEstimate ?? ulezSummary(vehicle)}
            verification={{
              href: "https://tfl.gov.uk/modes/driving/check-your-vehicle/",
              label: "Verify on TfL",
            }}
          />
        </div>
        <div className="report-layout">
          <div className="stack">
            <section className="card">
              <div className="card-heading">
                <h2>Vehicle details</h2>
                <span className="badge">
                  DVLA {sample ? "sample" : "record"}
                </span>
              </div>
              <div className="card-body data-columns">
                <dl className="detail-list">
                  <Detail label="Make" value={vehicle.make} />
                  <Detail label="Model" value={primary?.model} />
                  <Detail
                    label="Year of manufacture"
                    value={vehicle.yearOfManufacture}
                  />
                  <Detail label="Colour" value={vehicle.colour} />
                  <Detail
                    label="First registered"
                    value={vehicle.monthOfFirstRegistration}
                  />
                </dl>
                <dl className="detail-list">
                  <Detail label="Fuel" value={vehicle.fuelType} />
                  <Detail
                    label="Engine"
                    value={
                      vehicle.engineCapacity
                        ? `${vehicle.engineCapacity.toLocaleString("en-GB")} cc`
                        : null
                    }
                  />
                  <Detail
                    label="CO₂ emissions"
                    value={
                      vehicle.co2Emissions != null
                        ? `${vehicle.co2Emissions} g/km`
                        : null
                    }
                  />
                  <Detail label="Euro standard" value={vehicle.euroStatus} />
                  <Detail
                    label="Marked for export"
                    value={
                      vehicle.markedForExport == null
                        ? null
                        : vehicle.markedForExport
                          ? "Yes"
                          : "No"
                    }
                  />
                </dl>
              </div>
            </section>
            <section className="card" id="mileage">
              <div className="card-heading">
                <h2>Mileage information</h2>
                <Icon name="chart" />
              </div>
              <div className="card-body">
                <MileageChart tests={tests} />
              </div>
            </section>
            <section className="card" id="co2-emissions">
              <div className="card-heading">
                <h2>CO₂ emission figures</h2>
              </div>
              <div className="card-body">
                <Co2EmissionsChart emissions={vehicle.co2Emissions} />
              </div>
            </section>
            <section className="card" id="mot-history">
              <div className="card-heading">
                <h2>MOT history</h2>
                <span className="small muted">
                  {tests.length} recorded{" "}
                  {tests.length === 1 ? "test" : "tests"}
                </span>
              </div>
              {tests.length > 0 ? (
                <>
                  <div className="mot-legend" aria-label="MOT colour key">
                    <span className="mot-key mot-key-pass">Passed</span>
                    <span className="mot-key mot-key-minor">
                      Minor / advisory
                    </span>
                    <span className="mot-key mot-key-major">
                      Major / dangerous
                    </span>
                  </div>
                  <ol className="mot-timeline">
                    {tests.map((test, index) => (
                      <li
                        key={test.motTestNumber || index}
                        className={`mot-test mot-test-${test.testResult?.toUpperCase() === "PASSED" ? "pass" : test.testResult?.toUpperCase() === "FAILED" ? "fail" : "unknown"}`}
                      >
                        <div className="mot-test-top">
                          <div>
                            <strong
                              className={`status-label ${test.testResult?.toUpperCase() === "PASSED" ? "is-success" : test.testResult?.toUpperCase() === "FAILED" ? "is-danger" : ""}`}
                            >
                              <Icon
                                name={
                                  test.testResult?.toUpperCase() === "PASSED"
                                    ? "check"
                                    : "alert"
                                }
                                size={18}
                              />
                              {test.testResult?.toUpperCase() === "PASSED"
                                ? "Passed"
                                : test.testResult?.toUpperCase() === "FAILED"
                                  ? "Failed"
                                  : test.testResult || "Result not supplied"}
                            </strong>
                            <time>{formatDate(test.completedDate)}</time>
                          </div>
                          <span className="small">
                            {test.odometerValue
                              ? `${Number(test.odometerValue).toLocaleString("en-GB")} ${test.odometerUnit || "(unit not supplied)"}`
                              : "Mileage not recorded"}
                          </span>
                        </div>
                        <p className="mot-test-meta">
                          {test.expiryDate
                            ? `Expiry ${formatDate(test.expiryDate)} · `
                            : ""}
                          Test number{" "}
                          {test.motTestNumber?.startsWith("sample")
                            ? "[SAMPLE]"
                            : test.motTestNumber || "not supplied"}
                        </p>
                        {(test.rfrAndComments || test.defects || []).length >
                        0 ? (
                          <ul className="defects">
                            {(test.rfrAndComments || test.defects || []).map(
                              (defect, i) => (
                                <li
                                  key={i}
                                  className={`mot-defect defect-${motDefectCategory(defect)}`}
                                >
                                  <strong>
                                    {defect.dangerous
                                      ? "Dangerous"
                                      : (defect.type || "Unclassified")
                                          .toLowerCase()
                                          .replace(/^./, (c) =>
                                            c.toUpperCase(),
                                          )}
                                    :{" "}
                                  </strong>
                                  {defect.text}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : (
                          <p className="mot-test-meta">
                            No defects recorded for this test.
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <div className="empty-state">
                  <Icon name="file" size={28} />
                  <h3>
                    {motHistory === null
                      ? "MOT history unavailable"
                      : "No tests recorded"}
                  </h3>
                  <p>
                    {motHistory === null
                      ? "The MOT history service did not return a record. The DVLA details above are still available."
                      : "A vehicle may not yet need a test, may be exempt, or may not have a recorded history."}
                  </p>
                  {motHistory === null && (
                    <button
                      className="button button-secondary no-print"
                      onClick={() => setAttempt((a) => a + 1)}
                    >
                      Retry check
                    </button>
                  )}
                </div>
              )}
            </section>
            <section className="card">
              <div className="card-heading">
                <h2>Tax & registration</h2>
              </div>
              <div className="card-body">
                <dl className="detail-list">
                  <Detail label="Tax status" value={vehicle.taxStatus} />
                  <Detail
                    label="Tax due"
                    value={formatDate(vehicle.taxDueDate)}
                  />
                  <Detail
                    label="Latest V5C issued"
                    value={formatDate(vehicle.dateOfLastV5CIssued)}
                  />
                </dl>
                <p className="small muted" style={{ marginTop: 24 }}>
                  The V5C issue date is not proof of a keeper change. Tax rates
                  depend on registration date, emissions and possible
                  supplements.
                </p>
                <div className="button-row">
                  <a
                    href="https://www.gov.uk/vehicle-tax-rate-tables"
                    className="text-link small"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Check current DVLA tax rates
                  </a>
                  <a
                    href="https://tfl.gov.uk/modes/driving/check-your-vehicle/"
                    className="text-link small"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Confirm ULEZ with TfL
                  </a>
                </div>
              </div>
            </section>
            <section className="card" id="vehicle-performance">
              <div className="card-heading">
                <h2>Vehicle Performance</h2>
                <span className="badge">
                  {performanceUnlocked ? "Possible match" : "Sign-in required"}
                </span>
              </div>
              <div className="card-body">
                {!performanceUnlocked ? (
                  <div className="performance-lock">
                    <Icon name="lock" size={28} />
                    <h3>Sign in to unlock Vehicle Performance</h3>
                    <p>
                      View the suggested variant, power, transmission and top
                      speed with your free RevVeal account.
                    </p>
                    <Link
                      href={`/login?next=${encodeURIComponent(`/vehicle/${registration}`)}`}
                      className="button button-primary"
                    >
                      Sign in to unlock
                    </Link>
                  </div>
                ) : selected ? (
                  <>
                    <div className="field">
                      <label htmlFor="spec-match">
                        Check the suggested variant
                      </label>
                      <select
                        id="spec-match"
                        value={specId}
                        onChange={(e) => setSpecId(e.target.value)}
                      >
                        {specCandidates.map((spec) => (
                          <option value={spec.id} key={spec.id}>
                            {spec.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <dl className="detail-list">
                      <Detail
                        label="Power"
                        value={selected.bhp ? `${selected.bhp} bhp` : null}
                      />
                      <Detail
                        label="Transmission"
                        value={selected.transmission || selected.gearbox}
                      />
                      <Detail
                        label="Top speed"
                        value={
                          selected.topSpeedMph
                            ? `${selected.topSpeedMph} mph`
                            : null
                        }
                      />
                      <Detail
                        label="Insurance group"
                        value={selected.insuranceGroup}
                      />
                      <Detail
                        label="Doors / seats"
                        value={`${selected.doors || "—"} / ${selected.seats || "—"}`}
                      />
                    </dl>
                    <p className="small muted" style={{ marginTop: 24 }}>
                      Catalogue data is a guide. This is not a confirmed
                      specification or insurance quotation for this
                      registration.
                    </p>
                  </>
                ) : (
                  <p className="muted">
                    No matching catalogue specifications are available for this
                    vehicle.
                  </p>
                )}
              </div>
            </section>
            <section className="card">
              <div className="card-body">
                <span className="eyebrow">Not included in this check</span>
                <h2 style={{ fontSize: "var(--text-28)" }}>
                  What the free records cannot tell you
                </h2>
                <div className="locked-checks">
                  {[
                    "Outstanding finance",
                    "Stolen records",
                    "Insurance write-offs",
                    "Plate history & valuation",
                  ].map((label) => (
                    <div className="locked-check" key={label}>
                      <Icon name="lock" size={18} />
                      <h3>{label}</h3>
                      <p>
                        Not checked. No conclusion can be drawn from this free
                        report.
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/pricing" className="text-link">
                  Read about the £5.99 incl. VAT full report
                </Link>
              </div>
            </section>
            <div className="notice">
              <Icon name="info" />
              <div>
                <p>
                  <strong>Sources:</strong>{" "}
                  {sample
                    ? "RevVeal illustrative data"
                    : "DVLA Vehicle Enquiry Service; DVSA MOT History API; local specifications catalogue"}
                  .
                </p>
                <p>
                  Last updated:{" "}
                  {sample
                    ? "Fixed sample · not live"
                    : `${updated} (retrieval time; source update times are not supplied)`}
                  . RevVeal is not affiliated with the DVLA or DVSA.
                </p>
              </div>
            </div>
          </div>
          <aside className="report-sidebar">
            <section className="card">
              <div className="card-heading">
                <h2>MOT at a glance</h2>
              </div>
              <div className="card-body">
                {["DANGEROUS", "MAJOR", "MINOR", "ADVISORY"].map((type) => (
                  <div
                    className={`mot-summary-row severity-${type.toLowerCase()}`}
                    key={type}
                  >
                    <span>
                      {type.toLowerCase().replace(/^./, (c) => c.toUpperCase())}
                    </span>
                    <strong>
                      {motHistory === null
                        ? "—"
                        : defects.filter(
                            (d) => motDefectCategory(d) === type.toLowerCase(),
                          ).length}
                    </strong>
                  </div>
                ))}
                <p className="small muted" style={{ marginTop: 16 }}>
                  {motHistory === null
                    ? "MOT history is unavailable. Counts cannot be calculated."
                    : "Counts across all available tests, including past issues."}
                </p>
                <Link href="#mot-history" className="text-link small">
                  Read the test history
                </Link>
                <section className="mot-pass-summary" aria-label="MOT summary">
                  <h3>MOT summary</h3>
                  <dl className="mot-summary-stats">
                    <div>
                      <dt>Total tests</dt>
                      <dd>{motHistory === null ? "—" : tests.length}</dd>
                    </div>
                    <div>
                      <dt>Passed</dt>
                      <dd className="mot-passed">
                        {motHistory === null ? "—" : passedTests}
                      </dd>
                    </div>
                    <div>
                      <dt>Failed</dt>
                      <dd className="mot-failed">
                        {motHistory === null ? "—" : failedTests}
                      </dd>
                    </div>
                  </dl>
                  {passRate !== null ? (
                    <>
                      <div className="mot-pass-rate">
                        <strong>{passRate}% passed</strong>
                        <span>
                          {passedTests}/{tests.length} tests
                        </span>
                      </div>
                      <progress
                        value={passedTests}
                        max={tests.length}
                        aria-label="MOT pass rate"
                        aria-valuetext={`${passedTests} of ${tests.length} tests passed (${passRate}%)`}
                      >
                        {passRate}%
                      </progress>
                      {otherTests > 0 && (
                        <p className="small muted">
                          {otherTests}{" "}
                          {otherTests === 1 ? "test has" : "tests have"} no
                          pass/fail result.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="small muted">
                      {motHistory === null
                        ? "Pass rate unavailable."
                        : "No MOT tests recorded."}
                    </p>
                  )}
                </section>
              </div>
            </section>
            <ReportUpsell />
          </aside>
        </div>
        <div className="card card-body no-print" style={{ marginTop: 48 }}>
          <RegistrationSearch label="Check another vehicle" />
        </div>
      </div>
    </div>
  );
}
