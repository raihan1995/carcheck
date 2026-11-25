import type { VehicleData } from "./vehicle-types";

// Restored from the original report calculator, with 2026–27 GOV.UK rates.
// Checked 25 November 2026:
// https://www.gov.uk/vehicle-tax-rate-tables
// https://www.gov.uk/vehicle-tax-rate-tables/rates-for-cars-registered-on-or-after-1-march-2001
// https://www.gov.uk/vehicle-tax-rate-tables/rates-for-cars-and-light-goods-vehicles-registered-before-1-march-2001
export const ROAD_TAX_RATE_YEAR = "2026–27";

const LEGACY_BANDS = [
  { band: "A", max: 100, annual: 20, sixMonth: null },
  { band: "B", max: 110, annual: 20, sixMonth: null },
  { band: "C", max: 120, annual: 35, sixMonth: null },
  { band: "D", max: 130, annual: 170, sixMonth: 93.5 },
  { band: "E", max: 140, annual: 200, sixMonth: 110 },
  { band: "F", max: 150, annual: 225, sixMonth: 123.75 },
  { band: "G", max: 165, annual: 275, sixMonth: 151.25 },
  { band: "H", max: 175, annual: 325, sixMonth: 178.75 },
  { band: "I", max: 185, annual: 360, sixMonth: 198 },
  { band: "J", max: 200, annual: 410, sixMonth: 225.5 },
  { band: "K", max: 225, annual: 445, sixMonth: 244.75 },
  { band: "L", max: 255, annual: 760, sixMonth: 418 },
  { band: "M", max: Infinity, annual: 790, sixMonth: 434.5 },
] as const;

const FIRST_YEAR_BANDS = [
  { max: 0, rates: [10, 10] },
  { max: 50, rates: [115, 135] },
  { max: 75, rates: [135, 280] },
  { max: 90, rates: [280, 365] },
  { max: 100, rates: [365, 405] },
  { max: 110, rates: [405, 455] },
  { max: 130, rates: [455, 560] },
  { max: 150, rates: [560, 1410] },
  { max: 170, rates: [1410, 2270] },
  { max: 190, rates: [2270, 3420] },
  { max: 225, rates: [3420, 4850] },
  { max: 255, rates: [4850, 5690] },
  { max: Infinity, rates: [5690, 5690] },
] as const;

export type RoadTaxEstimate = {
  basis: string;
  annual: number;
  sixMonth: number | null;
  monthlyTotal: number;
  firstYear: number | null;
  supplementThreshold: number | null;
};

const validNumber = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const monthlyTotal = (annual: number) => Math.round(annual * 105) / 100;

/** Base car rates; the record does not confirm tax-class exemptions or list price. */
export function getRoadTax(
  vehicle: VehicleData,
  asOf = new Date(),
): RoadTaxEstimate | null {
  const registration = vehicle.monthOfFirstRegistration || "";
  if (!/^\d{4}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/.test(registration))
    return null;
  const month = registration.slice(0, 7);
  const date = new Date(
    `${registration.length === 7 ? `${month}-01` : registration}T00:00:00Z`,
  );
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, registration.length) !== registration ||
    !Number.isFinite(asOf.getTime()) ||
    date > asOf
  )
    return null;
  const approval = (vehicle.typeApproval || "").toUpperCase().trim();
  if (approval && !["M1", "M1G"].includes(approval)) return null;

  const base = { firstYear: null, supplementThreshold: null };
  if (month < "2001-03") {
    if (!validNumber(vehicle.engineCapacity) || vehicle.engineCapacity === 0)
      return null;
    const low = vehicle.engineCapacity <= 1549;
    const annual = low ? 230 : 375;
    return {
      ...base,
      basis: low ? "Engine up to 1,549 cc" : "Engine over 1,549 cc",
      annual,
      sixMonth: low ? 126.5 : 206.25,
      monthlyTotal: monthlyTotal(annual),
    };
  }
  if (month < "2017-04") {
    const co2 = vehicle.co2Emissions;
    if (!validNumber(co2)) return null;
    // DVLA normally supplies only a month. March 2006 cannot resolve the
    // 23 March Band K cutoff without the full registration day.
    if (co2 > 225 && registration === "2006-03") return null;
    const band =
      co2 > 225 && registration < "2006-03-23"
        ? LEGACY_BANDS[10]
        : LEGACY_BANDS.find((candidate) => co2 <= candidate.max)!;
    return {
      ...base,
      basis: `CO₂ band ${band.band}`,
      annual: band.annual,
      sixMonth: band.sixMonth,
      monthlyTotal: monthlyTotal(band.annual),
    };
  }

  const ageMonths =
    (asOf.getUTCFullYear() - date.getUTCFullYear()) * 12 +
    asOf.getUTCMonth() -
    date.getUTCMonth();
  const fuel = (vehicle.fuelType || "").toUpperCase();
  const otherDiesel =
    fuel.includes("DIESEL") &&
    !/\bRDE\s*2\b/i.test(vehicle.realDrivingEmissions || "");
  const firstYearBand =
    ageMonths < 12 && fuel && validNumber(vehicle.co2Emissions)
      ? FIRST_YEAR_BANDS.find((band) => vehicle.co2Emissions! <= band.max)
      : null;
  const zeroEmission =
    vehicle.co2Emissions === 0 || ["ELECTRIC", "ELECTRICITY"].includes(fuel);
  return {
    basis: "Standard rate from the second tax payment",
    annual: 200,
    sixMonth: 110,
    monthlyTotal: 210,
    firstYear: firstYearBand?.rates[otherDiesel ? 1 : 0] ?? null,
    supplementThreshold:
      ageMonths < 72 && !(zeroEmission && month < "2025-04")
        ? zeroEmission
          ? 50000
          : 40000
        : null,
  };
}
