"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type VehicleData = {
  registrationNumber: string;
  make?: string;
  colour?: string;
  fuelType?: string;
  co2Emissions?: number;
  engineCapacity?: number;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  monthOfFirstDvlaRegistration?: string;
  motStatus?: string;
  motExpiryDate?: string;
  taxStatus?: string;
  taxDueDate?: string;
  artEndDate?: string;
  markedForExport?: boolean;
  typeApproval?: string;
  revenueWeight?: number;
  wheelplan?: string;
  euroStatus?: string;
  realDrivingEmissions?: string;
  dateOfLastV5CIssued?: string;
};

type MotTestItem = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: string;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  dataSource?: string;
  rfrAndComments?: Array<{ text: string; type: string; dangerous?: boolean }>;
  defects?: Array<{ text: string; type: string; dangerous?: boolean }>;
};

type MotHistoryVehicle = {
  registration?: string;
  make?: string;
  model?: string;
  firstUsedDate?: string;
  fuelType?: string;
  primaryColour?: string;
  vehicleId?: string;
  registrationDate?: string;
  manufactureDate?: string;
  engineSize?: string;
  hasOutstandingRecall?: string;
  motTests?: MotTestItem[];
};

type ApiResponse = {
  vehicle: VehicleData;
  motHistory: MotHistoryVehicle[] | null;
  demo?: boolean;
  error?: string;
};

function formatDate(str: string | undefined): string {
  if (!str) return "—";
  // Handle ISO (e.g. 2025-04-24T14:00:32.000Z) or legacy (e.g. 2013.11.03 09:33:08)
  const datePart = str.includes("T") ? str.split("T")[0] : str.split(" ")[0]?.replace(/\./g, "-");
  if (!datePart) return str;
  try {
    return new Date(datePart).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** Parse date string (ISO or YYYY-MM) to timestamp; returns NaN if invalid */
function parseDate(str: string | undefined): number {
  if (!str) return NaN;
  const part = str.includes("T") ? str.split("T")[0] : str.split(" ")[0]?.replace(/\./g, "-") ?? str;
  const d = new Date(part);
  return isNaN(d.getTime()) ? NaN : d.getTime();
}

/** Years between two timestamps */
function yearsBetween(msStart: number, msEnd: number): number {
  return (msEnd - msStart) / (365.25 * 24 * 60 * 60 * 1000);
}

type MileageSummary = {
  yearlyAverageMiles: number;
  totalMiles: number;
  totalYears: number;
  fromDate: string;
  toDate: string;
} | null;

/**
 * Compute yearly average mileage from first registration to last MOT.
 * Uses 0 miles at first registration; first MOT might be years after registration (new car).
 */
function computeYearlyAverageMileage(
  monthOfFirstRegistration: string | undefined,
  motTests: MotTestItem[]
): MileageSummary {
  const testsWithOdometer = motTests
    .filter((t) => t.completedDate != null && t.odometerValue != null)
    .map((t) => ({
      dateMs: parseDate(t.completedDate),
      miles: Number(t.odometerValue),
    }))
    .filter((t) => !Number.isNaN(t.dateMs) && !Number.isNaN(t.miles));
  if (testsWithOdometer.length === 0) return null;

  testsWithOdometer.sort((a, b) => a.dateMs - b.dateMs);
  const firstMot = testsWithOdometer[0];
  const lastMot = testsWithOdometer[testsWithOdometer.length - 1];

  // Start date: first registration (DVLA) or, if missing, first MOT date
  let startMs = parseDate(monthOfFirstRegistration);
  if (Number.isNaN(startMs)) startMs = firstMot.dateMs;
  else {
    // monthOfFirstRegistration is "2018-06" – use first day of month
    const [y, m] = String(monthOfFirstRegistration).split("-").map(Number);
    if (!Number.isNaN(y) && !Number.isNaN(m)) startMs = new Date(y, m - 1, 1).getTime();
  }

  const totalMiles = lastMot.miles;
  const totalYears = yearsBetween(startMs, lastMot.dateMs);
  if (totalYears <= 0) return null;

  const yearlyAverageMiles = Math.round(totalMiles / totalYears);
  return {
    yearlyAverageMiles,
    totalMiles,
    totalYears,
    fromDate: new Date(startMs).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    toDate: new Date(lastMot.dateMs).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
  };
}

export default function VehiclePage() {
  const params = useParams();
  const router = useRouter();
  const registration = typeof params.registration === "string" ? params.registration : "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registration) {
      setLoading(false);
      setError("Missing registration.");
      return;
    }

    let cancelled = false;

    async function fetchVehicle() {
      try {
        const res = await fetch(
          `/api/check?registration=${encodeURIComponent(registration)}`
        );
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(json.error || "Could not load vehicle details.");
          setData(null);
          return;
        }

        setData(json);
        setError(null);
      } catch {
        if (!cancelled) {
          setError("Network error. Please try again.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVehicle();
    return () => {
      cancelled = true;
    };
  }, [registration]);

  const displayFields: (keyof VehicleData)[] = [
    "make",
    "colour",
    "fuelType",
    "yearOfManufacture",
    "monthOfFirstRegistration",
    "monthOfFirstDvlaRegistration",
    "engineCapacity",
    "co2Emissions",
    "motStatus",
    "motExpiryDate",
    "taxStatus",
    "taxDueDate",
    "artEndDate",
    "markedForExport",
    "typeApproval",
    "revenueWeight",
    "wheelplan",
    "euroStatus",
    "realDrivingEmissions",
    "dateOfLastV5CIssued",
  ];

  function formatValue(value: unknown): string {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Loading vehicle details…</p>
          <div className="mt-4 h-1 w-48 mx-auto bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-amber-500 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.vehicle) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-slate-100 border border-slate-200 p-8 text-center">
          <p className="text-red-600 text-lg mb-6">{error || "Vehicle not found."}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
          >
            Check another vehicle
          </Link>
        </div>
      </div>
    );
  }

  const { vehicle, motHistory, demo } = data;
  const primaryMot = motHistory?.[0];
  const motTests = primaryMot?.motTests ?? [];
  const mileageSummary = computeYearlyAverageMileage(vehicle.monthOfFirstRegistration, motTests);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 text-sm mb-8 transition-colors"
        >
          ← Back to check another vehicle
        </Link>

        {demo && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
            Demo data — add <code className="bg-slate-200 px-1.5 py-0.5 rounded">DVLA_API_KEY</code> and MOT credentials to your <code className="bg-slate-200 px-1.5 py-0.5 rounded">.env</code> for real results.
          </div>
        )}

        <header className="rounded-2xl bg-slate-100 border border-slate-200 p-6 sm:p-8 mb-6">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-1">
            Registration
          </p>
          <h1 className="text-3xl font-mono font-bold tracking-widest text-slate-900">
            {vehicle.registrationNumber.length <= 7
              ? vehicle.registrationNumber.replace(/(.{4})/g, "$1 ").trim()
              : vehicle.registrationNumber}
          </h1>
          {vehicle.make && (
            <p className="mt-2 text-xl text-slate-600">
              {vehicle.make}
              {vehicle.colour && ` · ${vehicle.colour}`}
            </p>
          )}
        </header>

        <section className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden mb-6">
          <h2 className="px-6 py-4 border-b border-slate-200 text-lg font-semibold text-slate-900">
            Vehicle details
          </h2>
          <dl className="p-6 grid gap-4 sm:grid-cols-2">
            {displayFields.map((key) => {
              const value = vehicle[key];
              if (value === undefined && key !== "markedForExport") return null;
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    {formatLabel(key)}
                  </dt>
                  <dd className="text-slate-900 font-medium">
                    {formatValue(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        {primaryMot && (primaryMot.model ?? primaryMot.engineSize ?? primaryMot.primaryColour ?? primaryMot.firstUsedDate ?? primaryMot.registrationDate ?? primaryMot.manufactureDate ?? primaryMot.hasOutstandingRecall) && (
          <section className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden mb-6">
            <h2 className="px-6 py-4 border-b border-slate-200 text-lg font-semibold text-slate-900">
              MOT vehicle info
            </h2>
            <dl className="p-6 grid gap-4 sm:grid-cols-2">
              {primaryMot.model && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Model</dt>
                  <dd className="text-slate-900 font-medium">{primaryMot.model}</dd>
                </div>
              )}
              {primaryMot.engineSize && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Engine size (MOT)</dt>
                  <dd className="text-slate-900 font-medium">{primaryMot.engineSize} cc</dd>
                </div>
              )}
              {primaryMot.primaryColour && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Primary colour (MOT)</dt>
                  <dd className="text-slate-900 font-medium">{primaryMot.primaryColour}</dd>
                </div>
              )}
              {primaryMot.firstUsedDate && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">First used date</dt>
                  <dd className="text-slate-900 font-medium">{formatDate(primaryMot.firstUsedDate)}</dd>
                </div>
              )}
              {primaryMot.registrationDate && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Registration date (MOT)</dt>
                  <dd className="text-slate-900 font-medium">{formatDate(primaryMot.registrationDate)}</dd>
                </div>
              )}
              {primaryMot.manufactureDate && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Manufacture date (MOT)</dt>
                  <dd className="text-slate-900 font-medium">{formatDate(primaryMot.manufactureDate)}</dd>
                </div>
              )}
              {primaryMot.hasOutstandingRecall && (
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Outstanding recall</dt>
                  <dd className="text-slate-900 font-medium">{primaryMot.hasOutstandingRecall}</dd>
                </div>
              )}
              {primaryMot.vehicleId && (
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Vehicle ID (MOT)</dt>
                  <dd className="text-slate-900 font-mono text-sm">{primaryMot.vehicleId}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        <section className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden mb-6">
          <h2 className="px-6 py-4 border-b border-slate-200 text-lg font-semibold text-slate-900">
            MOT history
          </h2>
          {motTests.length > 0 ? (
            <>
              {mileageSummary && (
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Yearly average mileage</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {mileageSummary.yearlyAverageMiles.toLocaleString()}{" "}
                    <span className="text-base font-normal text-slate-600">miles/year</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    From {mileageSummary.fromDate} to {mileageSummary.toDate} ·{" "}
                    {mileageSummary.totalMiles.toLocaleString()} miles over{" "}
                    {mileageSummary.totalYears.toFixed(1)} years
                  </p>
                </div>
              )}
            <ul className="divide-y divide-slate-200">
              {motTests.map((test, i) => (
                <li key={test.motTestNumber ?? i} className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        test.testResult === "PASSED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {test.testResult ?? "—"}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {formatDate(test.completedDate)}
                    </span>
                    {test.odometerValue && (
                      <span className="text-slate-500 text-sm">
                        {Number(test.odometerValue).toLocaleString()} {test.odometerUnit ?? "mi"}
                        {test.odometerResultType && (
                          <span className="text-slate-400 ml-1">({test.odometerResultType})</span>
                        )}
                      </span>
                    )}
                    {test.dataSource && (
                      <span className="text-slate-400 text-xs">Source: {test.dataSource}</span>
                    )}
                  </div>
                  {test.expiryDate && test.testResult === "PASSED" && (
                    <p className="text-slate-500 text-sm mb-2">
                      Expires {formatDate(test.expiryDate)}
                    </p>
                  )}
                  {((test.rfrAndComments ?? test.defects) ?? []).length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {(test.rfrAndComments ?? test.defects ?? []).map((rfr, j) => (
                        <li
                          key={j}
                          className={`text-sm ${
                            rfr.type === "FAIL" || rfr.type === "DANGEROUS"
                              ? "text-red-700"
                              : rfr.type === "ADVISORY"
                                ? "text-amber-700"
                                : rfr.type === "MINOR"
                                  ? "text-amber-600"
                                  : "text-slate-600"
                          }`}
                        >
                          <span className="font-medium uppercase text-slate-500 mr-2">
                            {rfr.type}
                          </span>
                          {rfr.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            </>
          ) : (
            <p className="p-6 text-slate-500">
              MOT info failed to retrieve.
            </p>
          )}
        </section>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Data from DVLA Vehicle Enquiry Service and MOT History API.</p>
        </footer>
      </div>
    </div>
  );
}
