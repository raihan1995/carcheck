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

/** EU-style CO2 emission bands (g/km): range, label, colour, and coloured bar width % (rest is grey). */
const CO2_BANDS = [
  { min: 0, max: 101, label: "A", color: "bg-green-500", barWidth: 32 },
  { min: 101, max: 120, label: "B-C", color: "bg-green-600", barWidth: 52 },
  { min: 121, max: 140, label: "D-E", color: "bg-lime-500", barWidth: 67 },
  { min: 141, max: 165, label: "F-G", color: "bg-yellow-500", barWidth: 77 },
  { min: 166, max: 185, label: "H-I", color: "bg-amber-500", barWidth: 82 },
  { min: 186, max: 225, label: "J-K", color: "bg-orange-500", barWidth: 92 },
  { min: 225, max: Infinity, label: "L-M", color: "bg-red-500", barWidth: 99 },
] as const;

/** Get the band and display letter for a CO2 value (g/km). Returns null if no value. */
function getCo2Band(co2: number | undefined): { band: (typeof CO2_BANDS)[number]; letter: string } | null {
  if (co2 == null || typeof co2 !== "number" || co2 < 0) return null;
  const band = CO2_BANDS.find((b) => co2 >= b.min && (b.max === Infinity || co2 <= b.max)) ?? CO2_BANDS[CO2_BANDS.length - 1];
  const letters = band.label.split("-");
  const mid = band.max === Infinity ? band.min + 50 : band.min + (band.max - band.min) / 2;
  const letter = co2 < mid ? letters[0] : (letters[1] ?? letters[0]);
  return { band, letter };
}
function parseEuroNumber(euroStatus: string | undefined): number {
  if (!euroStatus || typeof euroStatus !== "string") return NaN;
  const match = euroStatus.toUpperCase().match(/EURO\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : NaN;
}

/** TfL-style ULEZ compliance using DVLA VES data. Returns null when unknown. */
function getUlezCompliance(vehicle: {
  fuelType?: string;
  euroStatus?: string;
  monthOfFirstRegistration?: string;
  typeApproval?: string;
}): boolean | null {
  const fuel = (vehicle.fuelType ?? "").toUpperCase();
  const euro = parseEuroNumber(vehicle.euroStatus);
  const reg = vehicle.monthOfFirstRegistration ?? ""; // YYYY-MM

  // Electric: always compliant
  if (fuel.includes("ELECTRIC")) return true;

  // Motorcycles / mopeds (type approval L1e, L2e, L3e, L4e, L5e)
  const isMotorcycle = /^L[1-5]/.test((vehicle.typeApproval ?? "").toUpperCase());
  if (isMotorcycle) {
    if (!Number.isNaN(euro)) return euro >= 3;
    return reg >= "2007-07" ? true : reg ? false : null;
  }

  // Petrol: Euro 4+ or registered on or after 1 Jan 2006
  if (fuel.includes("PETROL")) {
    if (!Number.isNaN(euro)) return euro >= 4;
    return reg >= "2006-01" ? true : reg ? false : null;
  }

  // Diesel: Euro 6+ or registered on or after 1 Sep 2015
  if (fuel.includes("DIESEL")) {
    if (!Number.isNaN(euro)) return euro >= 6;
    return reg >= "2015-09" ? true : reg ? false : null;
  }

  // Other fuel (e.g. hybrid without electric): use Euro 6 if known, else unknown
  if (!Number.isNaN(euro)) return euro >= 6;
  return null;
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0-6.75h.008v.008H8.25V6.75Zm0 2.25h.008v.008H8.25V9Zm6-3h.008v.008H14.25V6.75Zm0 2.25h.008v.008H14.25V9Zm0 2.25h.008v.008H14.25v-.008Zm0 2.25h.008v.008H14.25V15Z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Loading vehicle details…</p>
          <div className="mt-4 h-1.5 w-40 mx-auto bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-600 text-base sm:text-lg font-medium mb-6">{error || "Vehicle not found."}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[52px] px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700 transition-all touch-manipulation"
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
  const ulezCompliant = getUlezCompliance(vehicle);
  const co2Band = getCo2Band(vehicle.co2Emissions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 overflow-x-hidden">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-12 pb-12 sm:pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 text-sm mb-6 sm:mb-8 py-2.5 -mx-2 px-3 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all min-h-[44px] touch-manipulation font-medium"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to check another vehicle
        </Link>

        {demo && (
          <div className="mb-4 sm:mb-6 rounded-2xl bg-amber-50/90 border border-amber-200/80 px-4 py-3.5 text-amber-800 text-sm shadow-sm">
            Demo data — add <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono text-xs break-all">DVLA_API_KEY</code> and MOT credentials to your <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono text-xs break-all">.env</code> for real results.
          </div>
        )}

        <header className="relative rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 mb-4 sm:mb-6 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-bl-3xl pointer-events-none" aria-hidden />
          <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1.5">
            Registration
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-slate-900 break-all font-mono">
            {vehicle.registrationNumber.length <= 7
              ? vehicle.registrationNumber.replace(/(.{4})/g, "$1 ").trim()
              : vehicle.registrationNumber}
          </h1>
          {vehicle.make && (
            <p className="mt-2 text-lg sm:text-xl text-slate-600 break-words font-medium">
              {vehicle.make}
              {vehicle.colour && <span className="text-slate-400 font-normal"> · {vehicle.colour}</span>}
            </p>
          )}
        </header>

        {ulezCompliant !== null && (
          <div
            className={`rounded-2xl border-2 px-4 sm:px-6 py-4 mb-4 sm:mb-6 shadow-md ${
              ulezCompliant
                ? "bg-gradient-to-br from-emerald-50 to-emerald-50/80 border-emerald-300/80 shadow-emerald-200/20"
                : "bg-gradient-to-br from-red-50 to-red-50/80 border-red-300/80 shadow-red-200/20"
            }`}
          >
            <p
              className={`text-base sm:text-lg font-bold ${
                ulezCompliant ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {ulezCompliant ? "✓ ULEZ compliant" : "✗ Not ULEZ compliant"}
            </p>
            <p className={`mt-0.5 text-xs sm:text-sm font-medium ${ulezCompliant ? "text-emerald-700" : "text-red-700"}`}>
              {vehicle.euroStatus ? `Euro status: ${vehicle.euroStatus}` : "Based on DVLA data"}
            </p>
          </div>
        )}

        <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden mb-4 sm:mb-6">
          <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
            Vehicle details
          </h2>
          <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {displayFields.map((key) => {
              const value = vehicle[key];
              return (
                <div key={key} className="flex flex-col gap-0.5 py-1">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    {formatLabel(key)}
                  </dt>
                  <dd className="text-slate-900 font-medium break-words">
                    {formatValue(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        {co2Band && (
          <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden mb-4 sm:mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">CO2 Emission Figures</h2>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                {vehicle.co2Emissions} g/km <span className="text-slate-500 font-semibold">({co2Band.letter})</span>
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-1">
              {CO2_BANDS.map((b) => {
                const isActive = b.min === co2Band.band.min && b.max === co2Band.band.max;
                const rangeLabel = b.max === Infinity ? "225+" : b.min === 0 ? "0-101" : `${b.min}-${b.max}`;
                return (
                  <div
                    key={b.label}
                    className={`flex items-center gap-2 sm:gap-3 py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-lime-100 border-l-4 border-lime-500 ring-2 ring-lime-400/80"
                        : ""
                    }`}
                  >
                    <span className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-slate-600 shrink-0 tabular-nums">
                      {rangeLabel}
                    </span>
                    <div className="flex-1 h-7 sm:h-8 rounded overflow-hidden bg-slate-200 flex">
                      <div
                        className={`h-full ${b.color} shrink-0`}
                        style={{ width: `${b.barWidth}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 shrink-0 w-6 sm:w-8 text-center">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {primaryMot && (primaryMot.model ?? primaryMot.engineSize ?? primaryMot.primaryColour ?? primaryMot.firstUsedDate ?? primaryMot.registrationDate ?? primaryMot.manufactureDate ?? primaryMot.hasOutstandingRecall) && (
          <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden mb-4 sm:mb-6">
            <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
              MOT vehicle info
            </h2>
            <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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

        <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden mb-4 sm:mb-6">
          <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
            MOT history
          </h2>
          {motTests.length > 0 ? (
            <>
              {mileageSummary && (
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-50 to-amber-50/30 border-b border-slate-100">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Yearly average mileage</p>
                  <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                    {mileageSummary.yearlyAverageMiles.toLocaleString()}{" "}
                    <span className="text-sm sm:text-base font-semibold text-slate-500">miles/year</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    From {mileageSummary.fromDate} to {mileageSummary.toDate} · {mileageSummary.totalMiles.toLocaleString()} miles over {mileageSummary.totalYears.toFixed(1)} years
                  </p>
                </div>
              )}
            <ul className="divide-y divide-slate-100">
              {motTests.map((test, i) => (
                <li key={test.motTestNumber ?? i} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        test.testResult === "PASSED"
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60"
                          : "bg-red-100 text-red-800 ring-1 ring-red-200/60"
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
                      </span>
                    )}
                  </div>
                  {test.expiryDate && test.testResult === "PASSED" && (
                    <p className="text-slate-500 text-sm mb-2">
                      Expires {formatDate(test.expiryDate)}
                    </p>
                  )}
                  {((test.rfrAndComments ?? test.defects) ?? []).length > 0 && (
                    <ul className="mt-2 space-y-1.5 text-sm break-words">
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
            <p className="p-4 sm:p-6 text-slate-500 text-sm">
              MOT info failed to retrieve.
            </p>
          )}
        </section>

        <footer className="mt-8 sm:mt-12 pb-8 text-center text-slate-400 text-xs sm:text-sm px-2 font-medium">
          <p>Data from DVLA Vehicle Enquiry Service and MOT History API.</p>
        </footer>
      </div>
    </div>
  );
}
