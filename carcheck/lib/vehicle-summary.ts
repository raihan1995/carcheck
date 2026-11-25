import type { MotTestItem, VehicleData, SummaryStatus } from "./vehicle-types";
export type { SummaryStatus } from "./vehicle-types";

export function formatDate(value?: string | null) {
  if (!value) return "Not supplied";
  const normalized = value.split(/[T ]/)[0].replaceAll(".", "-");
  const date = new Date(normalized);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Europe/London",
      }).format(date)
    : "Not supplied";
}
export function testTime(test: MotTestItem) {
  const raw = test.completedDate || "";
  const normalized = raw.includes("T")
    ? raw
    : raw.replace(/\./g, "-").replace(" ", "T");
  return Date.parse(normalized) || 0;
}
export function odometerMiles(test: MotTestItem): number | null {
  if (test.odometerValue == null || String(test.odometerValue).trim() === "")
    return null;
  if (test.odometerResultType && !/^READ$/i.test(test.odometerResultType))
    return null;
  const number = Number(test.odometerValue);
  if (!Number.isFinite(number) || number < 0) return null;
  const unit = (test.odometerUnit || "").toUpperCase();
  if (["MI", "MILES"].includes(unit)) return number;
  if (["KM", "KILOMETRES", "KILOMETERS"].includes(unit))
    return number / 1.609344;
  return null;
}
export function mileageReadings(tests: MotTestItem[]) {
  return tests
    .map((test) => ({ test, miles: odometerMiles(test), time: testTime(test) }))
    .filter(
      (point): point is { test: MotTestItem; miles: number; time: number } =>
        point.miles !== null && point.time > 0,
    )
    .sort((a, b) => a.time - b.time);
}

export function yearlyMileageReadings(tests: MotTestItem[]) {
  const years = new Map<number, ReturnType<typeof mileageReadings>[number]>();
  for (const point of mileageReadings(tests)) {
    years.set(new Date(point.time).getUTCFullYear(), point);
  }
  return [...years].map(([year, point]) => ({ year, ...point }));
}

export function motDefectCategory(defect: {
  type: string;
  dangerous?: boolean;
}) {
  const type = (defect.type || "").trim().toUpperCase();
  if (defect.dangerous || type === "DANGEROUS") return "dangerous";
  if (type === "MAJOR" || type === "FAIL") return "major";
  if (type === "MINOR") return "minor";
  if (type === "ADVISORY") return "advisory";
  return "unknown";
}

// Group the traditional A–M CO₂ ranges for a compact emissions comparison.
// These visual bands do not determine the vehicle's tax or ULEZ status.
// Reference: gov.uk/vehicle-tax-rate-tables/rates-for-cars-registered-on-or-after-1-march-2001
export const CO2_COMPARISON_BANDS = [
  { label: "A", max: 100, range: "0–100", color: "#15803d" },
  { label: "B–C", max: 120, range: "101–120", color: "#48a529" },
  { label: "D–E", max: 140, range: "121–140", color: "#a3bf26" },
  { label: "F–G", max: 165, range: "141–165", color: "#f0ca32" },
  { label: "H–I", max: 185, range: "166–185", color: "#eaaa22" },
  { label: "J–K", max: 225, range: "186–225", color: "#e87820" },
  { label: "L–M", max: Infinity, range: "226+", color: "#cf382d" },
] as const;

export function co2ComparisonBand(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    return null;
  return CO2_COMPARISON_BANDS.find((band) => value <= band.max) ?? null;
}

export function taxSummary(vehicle: VehicleData): SummaryStatus {
  const status = (vehicle.taxStatus || "").toUpperCase();
  if (status === "SORN")
    return { label: "SORN", state: "unknown", detail: "Declared off the road" };
  if (status === "TAXED")
    return {
      label: "Taxed",
      state: "success",
      detail: vehicle.taxDueDate
        ? `Due ${formatDate(vehicle.taxDueDate)}`
        : "Renewal date not supplied",
    };
  if (status === "UNTAXED")
    return {
      label: "Untaxed",
      state: "danger",
      detail: vehicle.taxDueDate
        ? `Due ${formatDate(vehicle.taxDueDate)}`
        : "Check with DVLA",
    };
  return {
    label: vehicle.taxStatus || "Not available",
    state: "unknown",
    detail: "Check the official DVLA record",
  };
}
export function motSummary(vehicle: VehicleData): SummaryStatus {
  const status = (vehicle.motStatus || "").toUpperCase();
  if (status === "VALID")
    return {
      label: "Valid MOT",
      state: "success",
      detail: vehicle.motExpiryDate
        ? `Expires ${formatDate(vehicle.motExpiryDate)}`
        : "Expiry date not supplied",
    };
  if (status === "NOT VALID")
    return {
      label: "Not valid",
      state: "danger",
      detail: "Check exemptions and the official record",
    };
  if (status === "NO DETAILS HELD")
    return {
      label: "No details held",
      state: "unknown",
      detail: "An MOT may not be due or recorded",
    };
  return {
    label: vehicle.motStatus || "Not available",
    state: "unknown",
    detail: "Check the official MOT record",
  };
}
export function ulezSummary(
  vehicle: VehicleData,
  specEuroStandard?: number | null,
): SummaryStatus {
  const result = (
    compliant: boolean | null,
    detail: string,
  ): SummaryStatus => ({
    label:
      compliant === true
        ? "Compliant"
        : compliant === false
          ? "Not compliant"
          : "Unknown",
    state:
      compliant === true
        ? "success"
        : compliant === false
          ? "danger"
          : "unknown",
    detail,
  });
  const fuel = (vehicle.fuelType || "").toUpperCase().trim();
  const dvlaEuro = Number(vehicle.euroStatus?.match(/(?:EURO\s*)?(\d+)/i)?.[1]);
  const validEuro = (value: number | null | undefined): value is number =>
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 9;
  const euro = validEuro(dvlaEuro)
    ? dvlaEuro
    : validEuro(specEuroStandard)
      ? specEuroStandard
      : null;
  const euroSource = validEuro(dvlaEuro)
    ? "DVLA"
    : "Matched catalogue estimate";
  if (!fuel) return result(null, "Fuel type not supplied");
  // Hybrids must meet the standard for their combustion engine.
  if (["ELECTRIC", "ELECTRICITY"].includes(fuel))
    return result(true, "Fully electric vehicle");
  const motorcycle = /^L[1-7]/.test((vehicle.typeApproval || "").toUpperCase());
  const threshold = motorcycle
    ? 3
    : fuel.includes("DIESEL")
      ? 6
      : fuel.includes("PETROL")
        ? 4
        : null;
  if (euro !== null && threshold !== null)
    return result(euro >= threshold, `${euroSource} · Euro ${euro}`);
  if (euro !== null && euro >= 6)
    return result(true, `${euroSource} · Euro ${euro}`);

  const registration = vehicle.monthOfFirstRegistration || "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(registration))
    return result(null, "Not enough emissions or registration information");
  const detail = `Registration-date estimate · ${registration}`;
  if (motorcycle) return result(registration >= "2007-07", detail);
  if (fuel.includes("PETROL")) return result(registration >= "2006-01", detail);
  // Earlier diesels can meet Euro 6, so a missing Euro record stays amber.
  if (fuel.includes("DIESEL") && registration >= "2015-09")
    return result(true, detail);
  return result(null, "Euro standard unavailable");
}
