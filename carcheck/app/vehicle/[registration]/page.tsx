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
  specs?: {
    bhp: number | null;
    torque: number | null;
    gearbox: string | null;
    drivetrain: string | null;
  } | null;
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

/** EU-style CO2 emission bands (g/km): range, label, and colour. Bar width is computed (A=25%, L-M=100%, rest evenly spread). */
const CO2_BANDS = [
  { min: 0, max: 101, label: "A", color: "bg-green-500" },
  { min: 101, max: 120, label: "B-C", color: "bg-green-600" },
  { min: 121, max: 140, label: "D-E", color: "bg-lime-500" },
  { min: 141, max: 165, label: "F-G", color: "bg-yellow-500" },
  { min: 166, max: 185, label: "H-I", color: "bg-amber-500" },
  { min: 186, max: 225, label: "J-K", color: "bg-orange-500" },
  { min: 225, max: Infinity, label: "L-M", color: "bg-red-500" },
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

/** GOV.UK first-year vehicle tax bands for cars registered on or after 1 April 2017. [lowCO2Rate, otherDieselRate] */
const ROAD_TAX_FIRST_YEAR_BANDS: { maxCo2: number; rates: [number, number] }[] = [
  { maxCo2: 0, rates: [10, 10] },
  { maxCo2: 50, rates: [110, 130] },
  { maxCo2: 75, rates: [130, 270] },
  { maxCo2: 90, rates: [270, 350] },
  { maxCo2: 100, rates: [350, 390] },
  { maxCo2: 110, rates: [390, 440] },
  { maxCo2: 130, rates: [440, 540] },
  { maxCo2: 150, rates: [540, 1360] },
  { maxCo2: 170, rates: [1360, 2190] },
  { maxCo2: 190, rates: [2190, 3300] },
  { maxCo2: 225, rates: [3300, 4680] },
  { maxCo2: 255, rates: [4680, 5490] },
  { maxCo2: Infinity, rates: [5490, 5490] },
];

/** Standard rates for second tax payment onwards (12 month, 6 month) in pounds. Cars registered on or after 1 April 2017. */
const ROAD_TAX_STANDARD_12_MONTH = 195;
const ROAD_TAX_STANDARD_6_MONTH = 107.25;

/** Expensive car supplement (list price over £40,000) — added to standard rate for 5 years (annual figure). */
const ROAD_TAX_LUXURY_SUPPLEMENT_ANNUAL = 425;

/** Bands for cars registered between 1 March 2001 and 31 March 2017. Petrol (TC48), diesel (TC49), alternative fuel (59), zero emission. */
const ROAD_TAX_BANDS_2001_2017: {
  band: string;
  minCo2: number;
  maxCo2: number;
  rate12Month: number;
  rate12MonthDD: number;
  rate12MonthlyInstalments: number;
  rate6Month: number | null;
  rate6MonthDD: number | null;
}[] = [
  { band: "A", minCo2: 0, maxCo2: 100, rate12Month: 20, rate12MonthDD: 20, rate12MonthlyInstalments: 21, rate6Month: null, rate6MonthDD: null },
  { band: "B", minCo2: 101, maxCo2: 110, rate12Month: 20, rate12MonthDD: 20, rate12MonthlyInstalments: 21, rate6Month: null, rate6MonthDD: null },
  { band: "C", minCo2: 111, maxCo2: 120, rate12Month: 35, rate12MonthDD: 35, rate12MonthlyInstalments: 36.75, rate6Month: null, rate6MonthDD: null },
  { band: "D", minCo2: 121, maxCo2: 130, rate12Month: 165, rate12MonthDD: 165, rate12MonthlyInstalments: 173.25, rate6Month: 90.75, rate6MonthDD: 86.63 },
  { band: "E", minCo2: 131, maxCo2: 140, rate12Month: 195, rate12MonthDD: 195, rate12MonthlyInstalments: 204.75, rate6Month: 107.25, rate6MonthDD: 102.38 },
  { band: "F", minCo2: 141, maxCo2: 150, rate12Month: 215, rate12MonthDD: 215, rate12MonthlyInstalments: 225.75, rate6Month: 118.25, rate6MonthDD: 112.88 },
  { band: "G", minCo2: 151, maxCo2: 165, rate12Month: 265, rate12MonthDD: 265, rate12MonthlyInstalments: 278.25, rate6Month: 145.75, rate6MonthDD: 139.13 },
  { band: "H", minCo2: 166, maxCo2: 175, rate12Month: 315, rate12MonthDD: 315, rate12MonthlyInstalments: 330.75, rate6Month: 173.25, rate6MonthDD: 165.38 },
  { band: "I", minCo2: 176, maxCo2: 185, rate12Month: 345, rate12MonthDD: 345, rate12MonthlyInstalments: 362.25, rate6Month: 189.75, rate6MonthDD: 181.13 },
  { band: "J", minCo2: 186, maxCo2: 200, rate12Month: 395, rate12MonthDD: 395, rate12MonthlyInstalments: 414.75, rate6Month: 217.25, rate6MonthDD: 207.38 },
  { band: "K", minCo2: 201, maxCo2: 225, rate12Month: 430, rate12MonthDD: 430, rate12MonthlyInstalments: 451.5, rate6Month: 236.5, rate6MonthDD: 225.75 },
  { band: "L", minCo2: 226, maxCo2: 255, rate12Month: 735, rate12MonthDD: 735, rate12MonthlyInstalments: 771.75, rate6Month: 404.25, rate6MonthDD: 385.88 },
  { band: "M", minCo2: 256, maxCo2: Infinity, rate12Month: 760, rate12MonthDD: 760, rate12MonthlyInstalments: 798, rate6Month: 418, rate6MonthDD: 399 },
];

/** Pre-1 March 2001: tax by engine size only. Not over 1549cc / Over 1549cc. */
const ROAD_TAX_PRE_2001_MAX_CC = 1549;
const ROAD_TAX_PRE_2001_LOW = { rate12Month: 220, rate12MonthlyDD: 231 };
const ROAD_TAX_PRE_2001_HIGH = { rate12Month: 360, rate12MonthlyDD: 378 };

type RoadTaxResult =
  | { period: "post2017"; firstYear: number; standard12Month: number; standard6Month: number; isOtherDiesel: boolean }
  | {
      period: "2001_2017";
      band: string;
      co2Range: string;
      rate12Month: number;
      rate12MonthDD: number;
      rate12MonthlyInstalments: number;
      rate6Month: number | null;
      rate6MonthDD: number | null;
    }
  | { period: "pre2001"; engineBand: string; rate12Month: number; rate12MonthlyDD: number };

/**
 * Get road tax figures based on registration date, CO2, fuel type, and engine size.
 * Covers: pre-Mar 2001 (engine size), Mar 2001–Mar 2017 (CO2 bands A–M), Apr 2017+ (first year + standard).
 */
function getRoadTax(
  co2: number | undefined,
  fuelType: string | undefined,
  monthOfFirstRegistration: string | undefined,
  realDrivingEmissions: string | undefined,
  engineCapacityCc: number | undefined
): RoadTaxResult | null {
  const reg = monthOfFirstRegistration ?? "";

  // Pre-1 March 2001: engine size only
  if (reg && reg < "2001-03") {
    const cc = engineCapacityCc != null && Number.isFinite(engineCapacityCc) ? engineCapacityCc : 0;
    const low = cc <= ROAD_TAX_PRE_2001_MAX_CC;
    const rates = low ? ROAD_TAX_PRE_2001_LOW : ROAD_TAX_PRE_2001_HIGH;
    return {
      period: "pre2001",
      engineBand: low ? `Not over ${ROAD_TAX_PRE_2001_MAX_CC}cc` : `Over ${ROAD_TAX_PRE_2001_MAX_CC}cc`,
      rate12Month: rates.rate12Month,
      rate12MonthlyDD: rates.rate12MonthlyDD,
    };
  }

  // 1 March 2001 – 31 March 2017: CO2 bands A–M (Band K includes >225g/km if registered before 23 March 2006)
  if (reg && reg >= "2001-03" && reg < "2017-04") {
    const co2Val = co2 != null && Number.isFinite(co2) ? co2 : 0;
    const beforeBandKExemption = reg < "2006-03-23";
    let bandDef = ROAD_TAX_BANDS_2001_2017.find(
      (b) => co2Val >= b.minCo2 && (b.maxCo2 === Infinity || co2Val <= b.maxCo2)
    );
    if (beforeBandKExemption && co2Val > 225) bandDef = ROAD_TAX_BANDS_2001_2017.find((b) => b.band === "K");
    if (!bandDef) bandDef = ROAD_TAX_BANDS_2001_2017[ROAD_TAX_BANDS_2001_2017.length - 1];
    const co2Range =
      bandDef.maxCo2 === Infinity ? `${bandDef.minCo2}+ g/km` : `${bandDef.minCo2}–${bandDef.maxCo2} g/km`;
    return {
      period: "2001_2017",
      band: bandDef.band,
      co2Range,
      rate12Month: bandDef.rate12Month,
      rate12MonthDD: bandDef.rate12MonthDD,
      rate12MonthlyInstalments: bandDef.rate12MonthlyInstalments,
      rate6Month: bandDef.rate6Month,
      rate6MonthDD: bandDef.rate6MonthDD,
    };
  }

  // On or after 1 April 2017
  if (!reg || reg < "2017-04") return null;
  if (co2 == null || typeof co2 !== "number" || co2 < 0) return null;

  const fuel = (fuelType ?? "").toUpperCase();
  const isDiesel = fuel.includes("DIESEL");
  const rde2 = (realDrivingEmissions ?? "").toUpperCase().includes("RDE2");
  const isOtherDiesel = isDiesel && !rde2;
  const colIndex = isOtherDiesel ? 1 : 0;

  const band = ROAD_TAX_FIRST_YEAR_BANDS.find((b) => co2 <= b.maxCo2);
  const firstYear = band ? band.rates[colIndex] : 5490;

  return {
    period: "post2017",
    firstYear,
    standard12Month: ROAD_TAX_STANDARD_12_MONTH,
    standard6Month: ROAD_TAX_STANDARD_6_MONTH,
    isOtherDiesel,
  };
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

/** Days from today to the given date (positive = in future, negative = in past). Returns null if date invalid or missing. */
function daysFromToday(dateStr: string | undefined): number | null {
  const ms = parseDate(dateStr);
  if (Number.isNaN(ms)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((ms - today.getTime()) / dayMs);
}

/**
 * UK: first MOT is required 3 years after first registration (cars/vans).
 * Prefer MOT API registration date; else DVLA month of first registration (1st of month).
 * Returns YYYY-MM-DD in local calendar, or null.
 */
function getFirstMotDueIsoString(
  motRegistrationDate: string | undefined,
  monthOfFirstRegistration: string | undefined
): string | null {
  if (motRegistrationDate) {
    const ms = parseDate(motRegistrationDate);
    if (!Number.isNaN(ms)) {
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) {
        const due = new Date(d.getFullYear() + 3, d.getMonth(), d.getDate());
        const y = due.getFullYear();
        const mo = String(due.getMonth() + 1).padStart(2, "0");
        const day = String(due.getDate()).padStart(2, "0");
        return `${y}-${mo}-${day}`;
      }
    }
  }
  if (monthOfFirstRegistration) {
    const parts = monthOfFirstRegistration.split("-");
    if (parts.length === 2) {
      const year = Number(parts[0]);
      const m = Number(parts[1]);
      if (Number.isFinite(year) && Number.isFinite(m) && m >= 1 && m <= 12) {
        const due = new Date(year + 3, m - 1, 1);
        const y = due.getFullYear();
        const mo = String(due.getMonth() + 1).padStart(2, "0");
        const day = String(due.getDate()).padStart(2, "0");
        return `${y}-${mo}-${day}`;
      }
    }
  }
  return null;
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
    "engineCapacity",
    "co2Emissions",
    "markedForExport",
    "typeApproval",
    "revenueWeight",
    "wheelplan",
    "euroStatus",
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

  const { vehicle, motHistory, specs, demo } = data;
  const primaryMot = motHistory?.[0];
  const motTests = primaryMot?.motTests ?? [];
  const mileageSummary = computeYearlyAverageMileage(vehicle.monthOfFirstRegistration, motTests);
  const ulezCompliant = getUlezCompliance(vehicle);
  const co2Band = getCo2Band(vehicle.co2Emissions);
  const roadTax = getRoadTax(
    vehicle.co2Emissions,
    vehicle.fuelType,
    vehicle.monthOfFirstRegistration,
    vehicle.realDrivingEmissions,
    vehicle.engineCapacity
  );

  const motTotal = motTests.length;
  const motPassed = motTests.filter((t) => (t.testResult ?? "").toUpperCase() === "PASSED").length;
  const motFailed = motTests.filter((t) => (t.testResult ?? "").toUpperCase() === "FAILED").length;
  const motPassRate = motTotal > 0 ? motPassed / motTotal : 0;

  function parseMonthToMs(month: string | undefined): number | null {
    if (!month) return null;
    const parts = month.split("-");
    if (parts.length !== 2) return null;
    const year = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) return null;
    return new Date(year, m - 1, 1).getTime();
  }

  const nowMs = Date.now();

  const motRegistrationDateMs = primaryMot?.registrationDate ? parseDate(primaryMot.registrationDate) : NaN;
  const motFirstUsedDateMs = primaryMot?.firstUsedDate ? parseDate(primaryMot.firstUsedDate) : NaN;
  const motManufactureDateMs = primaryMot?.manufactureDate ? parseDate(primaryMot.manufactureDate) : NaN;

  function monthStartFromMs(ms: number): number | null {
    if (!Number.isFinite(ms)) return null;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  }

  const dvlaFirstRegMonthMs = parseMonthToMs(vehicle.monthOfFirstRegistration);
  const motRegMonthMs = monthStartFromMs(motRegistrationDateMs);

  // "for this instance we should ignore the DD on MOT registration date (month-level) and
  // only apply the fairly-new suppression if DVLA month and MOT month match".
  const monthMatch =
    dvlaFirstRegMonthMs != null && motRegMonthMs != null && dvlaFirstRegMonthMs === motRegMonthMs;

  const ageYears = monthMatch && dvlaFirstRegMonthMs != null
    ? (nowMs - dvlaFirstRegMonthMs) / (365.25 * 24 * 60 * 60 * 1000)
    : null;
  const isFairlyNew = ageYears != null && ageYears < 4;

  // Age for import heuristic: prefer DVLA YOM, else MOT manufacture year, else MOT registration year.
  const calendarYear = new Date().getFullYear();
  let importHeuristicAgeYears: number | null = null;
  if (vehicle.yearOfManufacture != null && Number.isFinite(vehicle.yearOfManufacture)) {
    importHeuristicAgeYears = calendarYear - vehicle.yearOfManufacture;
  } else if (primaryMot?.manufactureDate) {
    const y = new Date(parseDate(primaryMot.manufactureDate)).getFullYear();
    if (Number.isFinite(y)) importHeuristicAgeYears = calendarYear - y;
  } else if (Number.isFinite(motRegistrationDateMs)) {
    const y = new Date(motRegistrationDateMs).getFullYear();
    if (Number.isFinite(y)) importHeuristicAgeYears = calendarYear - y;
  }

  const isOldEnoughForImportHint =
    importHeuristicAgeYears != null && importHeuristicAgeYears >= 9;
  const fewMotsForImportHint = motTotal <= 2;

  // Don't fall back: if the months don't match, don't apply the "fairly new" suppression.
  const likelyImported =
    fewMotsForImportHint &&
    isOldEnoughForImportHint &&
    vehicle.co2Emissions === 0 &&
    (!monthMatch || !isFairlyNew);

  const hideFirstUsedDate =
    primaryMot?.firstUsedDate != null &&
    primaryMot?.registrationDate != null &&
    !Number.isNaN(motFirstUsedDateMs) &&
    motFirstUsedDateMs === motRegistrationDateMs;

  const hideManufactureDate =
    primaryMot?.manufactureDate != null &&
    primaryMot?.registrationDate != null &&
    !Number.isNaN(motManufactureDateMs) &&
    motManufactureDateMs === motRegistrationDateMs;

  let lastMotMileage: number | null = null;
  let lastYearMileage: number | null = null;
  let hasMileageIssue = false;
  let yearlyLatestOdometer: Array<{ year: number; miles: number }> = [];

  if (motTests.length > 0) {
    const testsWithMileage = motTests
      .filter((t) => t.completedDate != null && t.odometerValue != null)
      .map((t) => ({
        dateMs: parseDate(t.completedDate),
        miles: Number(t.odometerValue),
        result: (t.testResult ?? "").toUpperCase(),
      }))
      .filter((t) => !Number.isNaN(t.dateMs) && !Number.isNaN(t.miles))
      .sort((a, b) => a.dateMs - b.dateMs);

    const count = testsWithMileage.length;
    if (count > 0) {
      const latest = testsWithMileage[count - 1];
      lastMotMileage = latest.miles;

      if (count > 1) {
        let previousForYear: { miles: number } | null = null;

        // Walk backwards to find the best previous reading for "last year" mileage:
        // prefer the most recent PASSED test, otherwise fall back to the latest earlier reading.
        for (let i = count - 2; i >= 0; i -= 1) {
          const candidate = testsWithMileage[i];
          if (candidate.miles > latest.miles) continue;

          if (candidate.result === "PASSED") {
            previousForYear = { miles: candidate.miles };
            break;
          }

          if (!previousForYear) {
            previousForYear = { miles: candidate.miles };
          }
        }

        if (previousForYear) {
          const diff = latest.miles - previousForYear.miles;
          lastYearMileage = diff > 0 ? diff : null;
        }
      }

      // Mileage-issues check:
      // If there are multiple MOT tests on the same calendar day, and at least one is PASSED,
      // then use the LAST PASSED mileage from that day (ignore FAILED/PRS for that day).
      // Tie-break (Option B): last PASSED/last entry based on the order after sorting.
      const dailyEffectiveMileages: { dateMs: number; miles: number }[] = [];
      let cursor = 0;
      while (cursor < count) {
        const dayKey = testsWithMileage[cursor].dateMs;
        let nextCursor = cursor + 1;
        while (nextCursor < count && testsWithMileage[nextCursor].dateMs === dayKey) {
          nextCursor += 1;
        }

        const daySlice = testsWithMileage.slice(cursor, nextCursor);

        let chosenMiles: number | null = null;
        for (const entry of daySlice) {
          if (entry.result === "PASSED") chosenMiles = entry.miles;
        }
        if (chosenMiles == null) {
          // No PASSED for that day: take the last entry's mileage for that day.
          chosenMiles = daySlice[daySlice.length - 1]?.miles ?? null;
        }

        if (chosenMiles != null) {
          dailyEffectiveMileages.push({ dateMs: dayKey, miles: chosenMiles });
        }

        cursor = nextCursor;
      }

      // Build a "latest mileage per year" dataset for the bar chart.
      // dailyEffectiveMileages is ordered by day asc, so the last entry for each year is the latest.
      const yearToMiles = new Map<number, number>();
      for (const point of dailyEffectiveMileages) {
        const year = new Date(point.dateMs).getFullYear();
        yearToMiles.set(year, point.miles);
      }
      yearlyLatestOdometer = Array.from(yearToMiles.entries())
        .map(([year, miles]) => ({ year, miles }))
        .sort((a, b) => a.year - b.year);

      for (let i = 1; i < dailyEffectiveMileages.length; i += 1) {
        if (dailyEffectiveMileages[i].miles < dailyEffectiveMileages[i - 1].miles) {
          hasMileageIssue = true;
          break;
        }
      }
    }
  }

  const taxDaysLeft = daysFromToday(vehicle.taxDueDate);
  const taxValid = taxDaysLeft !== null && taxDaysLeft > 0;

  const firstMotDueIso = getFirstMotDueIsoString(
    primaryMot?.registrationDate,
    vehicle.monthOfFirstRegistration
  );
  const firstMotDueDaysLeft = firstMotDueIso ? daysFromToday(firstMotDueIso) : null;

  /** No MOT tests yet and first MOT due date is still in the future (within 3-year exemption). */
  const motExemptionActive =
    motTotal === 0 &&
    firstMotDueDaysLeft !== null &&
    firstMotDueDaysLeft > 0;

  let motDaysLeft: number | null;
  if (motExemptionActive) {
    motDaysLeft = firstMotDueDaysLeft;
  } else if (vehicle.motExpiryDate) {
    motDaysLeft = daysFromToday(vehicle.motExpiryDate);
  } else if (motTotal === 0 && firstMotDueDaysLeft !== null) {
    motDaysLeft = firstMotDueDaysLeft;
  } else {
    motDaysLeft = null;
  }

  const motValid = motExemptionActive || (motDaysLeft !== null && motDaysLeft > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 overflow-x-hidden">
      <div className="mx-auto max-w-3xl lg:max-w-6xl px-4 py-6 sm:py-12 pb-12 sm:pb-16">
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
          <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 text-center">
            Registration
          </p>
          <div className="flex justify-center">
            <div
              className="inline-block rounded-lg border-2 border-slate-800 bg-[#FFD132] px-5 sm:px-8 py-3 sm:py-4 shadow-md"
              aria-label="Registration number"
            >
              <span className="text-3xl sm:text-5xl font-extrabold tracking-[0.18em] text-black font-mono uppercase">
                {vehicle.registrationNumber}
              </span>
            </div>
          </div>
          {vehicle.make && (
            <p className="mt-4 text-lg sm:text-xl text-slate-600 break-words font-medium text-center">
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
              {ulezCompliant ? "✓ ULEZ compliant" : "⚠ Not ULEZ compliant"}
            </p>
            <p className={`mt-0.5 text-xs sm:text-sm font-medium ${ulezCompliant ? "text-emerald-700" : "text-red-700"}`}>
              {vehicle.euroStatus ? `Euro status: ${vehicle.euroStatus}` : "Based on DVLA data"}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Check your vehicle on{" "}
              <a
                href="https://tfl.gov.uk/modes/driving/check-your-vehicle/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 font-medium hover:underline"
              >
                TfL&apos;s ULEZ checker
              </a>
              .
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div
            className={`rounded-2xl border-2 px-4 sm:px-6 py-4 shadow-md ${
              taxValid
                ? "bg-gradient-to-br from-emerald-50 to-emerald-50/80 border-emerald-300/80 shadow-emerald-200/20"
                : "bg-gradient-to-br from-red-50 to-red-50/80 border-red-300/80 shadow-red-200/20"
            }`}
          >
            <p className={`text-sm font-semibold uppercase tracking-wider ${taxValid ? "text-emerald-700" : "text-red-700"}`}>
              Tax
            </p>
            <p className={`mt-1 text-base sm:text-lg font-bold ${taxValid ? "text-emerald-800" : "text-red-800"}`}>
              Expires: {vehicle.taxDueDate ? formatDate(vehicle.taxDueDate) : "—"}
            </p>
            <p className={`mt-0.5 text-sm font-medium ${taxValid ? "text-emerald-700" : "text-red-700"}`}>
              {taxDaysLeft !== null
                ? taxDaysLeft > 0
                  ? `${taxDaysLeft} day${taxDaysLeft === 1 ? "" : "s"} left`
                  : taxDaysLeft < 0
                    ? "Expired"
                    : "Expires today"
                : "—"}
            </p>
            {!taxValid && (
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                <a
                  href="https://www.gov.uk/vehicle-tax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 font-medium hover:underline"
                >
                  Tax your vehicle on GOV.UK
                </a>
              </p>
            )}
          </div>
          <div
            className={`rounded-2xl border-2 px-4 sm:px-6 py-4 shadow-md ${
              motValid
                ? "bg-gradient-to-br from-emerald-50 to-emerald-50/80 border-emerald-300/80 shadow-emerald-200/20"
                : "bg-gradient-to-br from-red-50 to-red-50/80 border-red-300/80 shadow-red-200/20"
            }`}
          >
            <p className={`text-sm font-semibold uppercase tracking-wider ${motValid ? "text-emerald-700" : "text-red-700"}`}>
              MOT
            </p>
            {motExemptionActive && firstMotDueIso ? (
              <>
                <p className="mt-1 text-base sm:text-lg font-bold text-emerald-800">
                  MOT not required until {formatDate(firstMotDueIso)}
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                  New car first MOT is due 3 years after first registration.
                </p>
              </>
            ) : (
              <>
                <p className={`mt-1 text-base sm:text-lg font-bold ${motValid ? "text-emerald-800" : "text-red-800"}`}>
                  Expires:{" "}
                  {vehicle.motExpiryDate
                    ? formatDate(vehicle.motExpiryDate)
                    : firstMotDueIso
                      ? formatDate(firstMotDueIso)
                      : "—"}
                </p>
                <p className={`mt-0.5 text-sm font-medium ${motValid ? "text-emerald-700" : "text-red-700"}`}>
                  {motDaysLeft !== null
                    ? motDaysLeft > 0
                      ? `${motDaysLeft} day${motDaysLeft === 1 ? "" : "s"} left`
                      : motDaysLeft < 0
                        ? "Expired"
                        : "Expires today"
                    : "—"}
                </p>
                {motDaysLeft !== null && motDaysLeft < 0 && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">
                    <a
                      href="https://bookmygarage.com/mot/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 font-medium hover:underline"
                    >
                      Book an MOT
                    </a>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
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
              {likelyImported && (
                <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-amber-700 font-semibold text-sm">
                  Vehicle likely imported
                </p>
              )}
            </section>

            <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
              <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
                Vehicle performance
              </h2>
              <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5 py-1">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">BHP</dt>
                  <dd className="text-slate-900 font-semibold">{specs?.bhp != null ? specs.bhp : "—"}</dd>
                </div>
                <div className="flex flex-col gap-0.5 py-1">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Torque</dt>
                  <dd className="text-slate-900 font-semibold">
                    {specs?.torque != null ? `${specs.torque} Nm` : "—"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 py-1">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Gearbox</dt>
                  <dd className="text-slate-900 font-semibold capitalize">{specs?.gearbox || "—"}</dd>
                </div>
                <div className="flex flex-col gap-0.5 py-1">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Drivetrain</dt>
                  <dd className="text-slate-900 font-semibold">{specs?.drivetrain || "—"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
              <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
                Mileage information
              </h2>
              {lastMotMileage != null || lastYearMileage != null || mileageSummary ? (
                <>
                  <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="flex flex-col gap-0.5 py-1">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Last MOT mileage</dt>
                    <dd className="text-slate-900 font-semibold text-lg">
                      {lastMotMileage != null ? `${lastMotMileage.toLocaleString()} miles` : "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-1">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Mileage issues</dt>
                    <dd
                      className={`font-semibold text-lg ${
                        hasMileageIssue ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {hasMileageIssue ? "Yes" : "No"}
                    </dd>
                  </div>
                  {mileageSummary && (
                    <div className="flex flex-col gap-0.5 py-1">
                      <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        Average yearly mileage
                      </dt>
                      <dd className="text-slate-900 font-semibold text-lg">
                        {mileageSummary.yearlyAverageMiles.toLocaleString()} miles/year
                      </dd>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 py-1">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Mileage last year</dt>
                    <dd className="text-slate-900 font-semibold text-lg">
                      {lastYearMileage != null ? `${lastYearMileage.toLocaleString()} miles` : "—"}
                    </dd>
                  </div>
                  </dl>
                  {yearlyLatestOdometer.length > 0 && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      Latest odometer per year
                    </p>
                    <div className="mt-3 space-y-3">
                      {(() => {
                        const maxMiles = Math.max(...yearlyLatestOdometer.map((p) => p.miles));
                        const safeMax = maxMiles > 0 ? maxMiles : 1;
                        return yearlyLatestOdometer.map((p) => {
                          const widthPct = Math.round((p.miles / safeMax) * 100);
                          return (
                            <div key={p.year} className="flex items-center gap-3">
                              <div className="w-14 text-xs font-semibold text-slate-600">{p.year}</div>
                              <div className="flex-1 h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-amber-500"
                                  style={{ width: `${widthPct}%` }}
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="w-24 text-right text-xs font-mono text-slate-600">
                                {p.miles.toLocaleString()}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  )}
                </>
              ) : (
                <p className="p-4 sm:p-6 text-slate-500 text-sm">
                  Mileage information not available from MOT history.
                </p>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
              <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
                MOT summary
              </h2>
              <dl className="p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4 divide-x divide-slate-100">
                <div className="flex flex-col gap-0.5 py-1 px-1 sm:px-2 text-center min-w-0">
                  <dt className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold leading-tight">Total MOT tests</dt>
                  <dd className="text-slate-900 font-semibold text-base sm:text-lg tabular-nums">{motTotal}</dd>
                </div>
                <div className="flex flex-col gap-0.5 py-1 px-1 sm:px-2 text-center min-w-0">
                  <dt className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold leading-tight">Passed</dt>
                  <dd className="text-emerald-700 font-semibold text-base sm:text-lg tabular-nums">{motPassed}</dd>
                </div>
                <div className="flex flex-col gap-0.5 py-1 px-1 sm:px-2 text-center min-w-0">
                  <dt className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold leading-tight">Failed</dt>
                  <dd className="text-red-700 font-semibold text-base sm:text-lg tabular-nums">{motFailed}</dd>
                </div>
              </dl>
              {motTotal > 0 && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                  <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${motPassRate * 100}%` }}
                      aria-hidden="true"
                    />
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${(1 - motPassRate) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-1.5 flex flex-col items-center justify-center gap-0.5 text-[10px] text-slate-500">
                    <span>{Math.round(motPassRate * 100)}% passed</span>
                    <span>
                      {motPassed}/{motTotal} tests
                    </span>
                  </div>
                </div>
              )}
              {motTotal === 0 && (
                <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-slate-500 text-sm">No MOT history retrieved.</p>
              )}
            </section>

            {primaryMot && (primaryMot.model ?? primaryMot.engineSize ?? primaryMot.primaryColour ?? primaryMot.firstUsedDate ?? primaryMot.registrationDate ?? primaryMot.manufactureDate ?? primaryMot.hasOutstandingRecall) && (
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
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
                  {primaryMot.firstUsedDate && !hideFirstUsedDate && (
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
                  {primaryMot.manufactureDate && !hideManufactureDate && (
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

            <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
              <h2 className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 text-base sm:text-lg font-bold text-slate-900 bg-slate-50/50">
                Road tax
              </h2>
              {roadTax ? (
                <>
                  {roadTax.period === "post2017" && (
                    <>
                      <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="flex flex-col gap-0.5 py-1">
                          <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">First year (12 months)</dt>
                          <dd className="text-slate-900 font-semibold text-lg">£{roadTax.firstYear.toLocaleString()}</dd>
                        </div>
                        <div className="flex flex-col gap-0.5 py-1">
                          <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">12 month payment</dt>
                          <dd className="text-slate-900 font-semibold text-lg">
                            £{roadTax.standard12Month.toLocaleString()}{" "}
                            <span
                              className="text-slate-600 font-semibold"
                              title="Standard rate plus £425/year expensive car supplement (list price over £40,000)"
                            >
                              (£{(roadTax.standard12Month + ROAD_TAX_LUXURY_SUPPLEMENT_ANNUAL).toLocaleString()})
                            </span>
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5 py-1">
                          <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">6 month payment</dt>
                          <dd className="text-slate-900 font-semibold text-lg">
                            £{roadTax.standard6Month.toFixed(2)}{" "}
                            <span
                              className="text-slate-600 font-semibold"
                              title="6-month payment plus half the annual £425 expensive car supplement (pro rata)"
                            >
                              (£{(roadTax.standard6Month + ROAD_TAX_LUXURY_SUPPLEMENT_ANNUAL / 2).toFixed(2)})
                            </span>
                          </dd>
                        </div>
                      </dl>
                      <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs text-slate-500">
                        Cars with a list price over £40,000 may pay an extra £425/year for 5 years.
                      </p>
                    </>
                  )}
                  {roadTax.period === "2001_2017" && (
                    <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="flex flex-col gap-0.5 py-1 sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Band</dt>
                        <dd className="text-slate-900 font-semibold text-lg">{roadTax.band}: {roadTax.co2Range}</dd>
                      </div>
                      <div className="flex flex-col gap-0.5 py-1">
                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Single 12 month payment</dt>
                        <dd className="text-slate-900 font-semibold text-lg">£{roadTax.rate12Month.toLocaleString()}</dd>
                      </div>
                      <div className="flex flex-col gap-0.5 py-1">
                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">12 monthly instalments (DD)</dt>
                        <dd className="text-slate-900 font-semibold text-lg">£{roadTax.rate12MonthlyInstalments.toLocaleString()}</dd>
                      </div>
                      <div className="flex flex-col gap-0.5 py-1">
                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Single 6 month payment</dt>
                        <dd className="text-slate-900 font-semibold text-lg">{roadTax.rate6Month != null ? `£${roadTax.rate6Month.toFixed(2)}` : "N/A"}</dd>
                      </div>
                    </dl>
                  )}
                  {roadTax.period === "pre2001" && (
                    <dl className="p-4 sm:p-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="flex flex-col gap-0.5 py-1">
                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Engine size</dt>
                        <dd className="text-slate-900 font-semibold text-lg">{roadTax.engineBand}</dd>
                      </div>
                      <div className="flex flex-col gap-0.5 py-1">
                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold">12 month payment</dt>
                        <dd className="text-slate-900 font-semibold text-lg">£{roadTax.rate12Month.toLocaleString()}</dd>
                      </div>
                    </dl>
                  )}
                  <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs text-slate-500">
                    Source:{" "}
                    <a
                      href="https://www.gov.uk/vehicle-tax-rate-tables"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      GOV.UK
                    </a>
                    .
                  </p>
                </>
              ) : (
                <p className="p-4 sm:p-6 text-slate-500 text-sm">
                  Road tax rates not available (e.g. missing registration date or CO2/engine data).
                </p>
              )}
            </section>

            {co2Band && (
              <section className="rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">CO2 emission figures</h2>
                  <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                    {vehicle.co2Emissions} g/km{" "}
                    <span className="text-slate-500 font-semibold">({co2Band.letter})</span>
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-1">
                  {CO2_BANDS.map((b, i) => {
                    const isActive = b.min === co2Band.band.min && b.max === co2Band.band.max;
                    const rangeLabel = b.max === Infinity ? "225+" : b.min === 0 ? "0-101" : `${b.min}-${b.max}`;
                    const barWidth =
                      i === 0 ? 25 : i === CO2_BANDS.length - 1 ? 100 : 25 + (i / (CO2_BANDS.length - 1)) * 75;
                    return (
                      <div
                        key={b.label}
                        className={`flex items-center gap-2 sm:gap-3 py-2 px-3 rounded-lg transition-colors ${
                          isActive ? "bg-lime-100 border-l-4 border-lime-500 ring-2 ring-lime-400/80" : ""
                        }`}
                      >
                        <span className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-slate-600 shrink-0 tabular-nums">
                          {rangeLabel}
                        </span>
                        <div className="flex-1 h-7 sm:h-8 rounded overflow-hidden bg-slate-200 flex">
                          <div className={`h-full ${b.color} shrink-0`} style={{ width: `${barWidth}%` }} />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 shrink-0 w-6 sm:w-8 text-center">
                          {b.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

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
                      {(test.rfrAndComments ?? test.defects ?? []).map((rfr, j) => {
                        const type = (rfr.type ?? "").toUpperCase();
                        const colourClass =
                          type === "FAIL" || type === "DANGEROUS" || type === "MAJOR"
                            ? "text-red-700"
                            : type === "MINOR"
                              ? "text-amber-600"
                              : type === "ADVISORY"
                                ? "text-slate-800"
                                : "text-slate-600";

                        return (
                          <li key={j} className={`text-sm ${colourClass}`}>
                            <span className="font-semibold uppercase mr-2">
                              {type}
                            </span>
                            {rfr.text}
                          </li>
                        );
                      })}
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
