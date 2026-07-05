/**
 * Look up car performance specs from preprocessed UK-Cars index.
 */

import fs from "fs";
import path from "path";

export type CarSpecs = {
  bhp: number | null;
  torque: number | null;
  gearbox: string | null;
  drivetrain: string | null;
  acceleration0100: number | null;
  topSpeedMph: number | null;
  matchedVariant: string | null;
};

export type VehicleSpecDetails = CarSpecs & {
  id: string;
  label: string;
  makeLabel: string | null;
  modelLabel: string | null;
  seriesLabel: string | null;
  variantLabel: string | null;
  yearFrom: number;
  yearTo: number | null;
  engineCc: number | null;
  cylinders: number | null;
  valves: number | null;
  fuel: string | null;
  transmission: string | null;
  co2Gkm: number | null;
  euroStandard: number | null;
  newPrice: string | null;
  mpg: string | null;
  insuranceGroup: string | null;
  fuelCapacity: string | null;
  batteryCapacity: string | null;
  weightKg: string | null;
  lengthMm: string | null;
  widthMm: string | null;
  heightMm: string | null;
  wheelbaseMm: string | null;
  doors: number | null;
  seats: number | null;
  luggageCapacity: string | null;
};

export type SpecCandidate = VehicleSpecDetails;

export type SpecLookupParams = {
  make?: string;
  motModel?: string;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  motRegistrationDate?: string;
  engineCapacityCc?: number;
  fuelType?: string;
  co2Emissions?: number;
  revenueWeightKg?: number;
};

export type SpecCandidatesResult = {
  candidates: SpecCandidate[];
  suggestedId: string | null;
};

type MakeSpecRecord = {
  id?: string;
  make?: string;
  makeLabel?: string | null;
  model: string;
  modelLabel?: string | null;
  seriesLabel?: string | null;
  variant: string;
  variantLabel: string | null;
  yearFrom: number;
  yearTo: number | null;
  productionStart?: string | null;
  productionEnd?: string | null;
  engineCc: number | null;
  cylinders?: number | null;
  valves?: number | null;
  fuel: string;
  bhp: number | null;
  torqueNm: number | null;
  gearbox: string | null;
  drivetrain: string | null;
  transmission?: string | null;
  acceleration0100: number | null;
  topSpeedMph: number | null;
  co2Gkm: number | null;
  co2Min?: number | null;
  co2Max?: number | null;
  euroStandard?: number | null;
  newPrice?: string | null;
  mpg?: string | null;
  insuranceGroup?: string | null;
  fuelCapacity?: string | null;
  batteryCapacity?: string | null;
  weightKg?: string | null;
  weightKgNum?: number | null;
  lengthMm?: string | null;
  widthMm?: string | null;
  heightMm?: string | null;
  wheelbaseMm?: string | null;
  doors?: number | null;
  seats?: number | null;
  luggageCapacity?: string | null;
};

type MakeSpecsIndex = Record<string, MakeSpecRecord[]>;

const MAKE_INDEX_ALIASES: Record<string, string> = {
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  vw: "volkswagen",
  "land rover": "land-rover",
  "aston martin": "aston-martin",
  "alfa romeo": "alfa-romeo",
};

/** Allow old-stock registrations shortly after catalogue production end (e.g. C 200 Jul 2018). */
const PRODUCTION_END_GRACE_MS = Math.round(6 * 30.44 * 24 * 60 * 60 * 1000);

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

type ProductionWindowFit = "strict" | "grace" | "none";

let cachedMakeIndex: MakeSpecsIndex | null = null;

function loadMakeIndex(): MakeSpecsIndex {
  if (cachedMakeIndex) return cachedMakeIndex;
  const p = path.join(process.cwd(), "data", "make-specs-index.json");
  if (!fs.existsSync(p)) {
    cachedMakeIndex = {};
    return cachedMakeIndex;
  }
  cachedMakeIndex = JSON.parse(fs.readFileSync(p, "utf8")) as MakeSpecsIndex;
  return cachedMakeIndex;
}

function normalize(s: string | undefined): string {
  if (s == null || typeof s !== "string") return "";
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function tokenize(s: string | undefined): string[] {
  if (!s) return [];
  return normalize(s)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 2 || /^\d+$/.test(t));
}

function makeVariants(make: string): string[] {
  const n = normalize(make);
  if (!n) return [];
  const out = new Set<string>();
  out.add(n);
  out.add(n.replace(/-benz$/, "").trim());
  out.add(n.replace(/\s+/g, "-"));
  out.add(n.replace(/-/g, " "));
  return [...out].filter(Boolean);
}

function resolveMakeIndexKey(make: string | undefined, index: MakeSpecsIndex): string | null {
  if (!make) return null;
  for (const variant of makeVariants(make)) {
    const hyphen = variant.replace(/\s+/g, "-");
    if (index[hyphen]) return hyphen;
    if (index[variant]) return variant;
    const alias = MAKE_INDEX_ALIASES[variant] ?? MAKE_INDEX_ALIASES[hyphen];
    if (alias && index[alias]) return alias;
  }
  return null;
}

function parseDateMs(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = trimmed.includes("T") ? trimmed : trimmed.replace(/\./g, "-");
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/** Year: manufacture → first registration month → MOT registration date. */
export function resolveVehicleYear(params: SpecLookupParams): number | null {
  if (params.yearOfManufacture != null && Number.isFinite(params.yearOfManufacture)) {
    return params.yearOfManufacture;
  }
  const month = params.monthOfFirstRegistration?.trim();
  if (month) {
    const y = parseInt(month.split("-")[0] ?? "", 10);
    if (Number.isFinite(y)) return y;
  }
  const motMs = parseDateMs(params.motRegistrationDate);
  if (motMs != null) return new Date(motMs).getFullYear();
  return null;
}

function resolveRegistrationMs(params: SpecLookupParams): number | null {
  const month = params.monthOfFirstRegistration?.trim();
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m)) {
      return new Date(y, m - 1, 1).getTime();
    }
  }
  return parseDateMs(params.motRegistrationDate);
}

function isCClassFamily(csvModel: string): boolean {
  const m = normalize(csvModel);
  if (!m.includes("c-class") && !m.includes("c class")) return false;
  if (m.includes("cla") && !m.includes("c-class")) return false;
  if (m.includes("glc") || m.includes("gla") || m.includes("slc")) return false;
  return true;
}

function matchesMotModel(csvModel: string, csvVariant: string, motModel: string | undefined): boolean {
  const mot = normalize(motModel ?? "");
  const variantNorm = normalize(csvVariant);
  const modelNorm = normalize(csvModel);
  const csvText = `${modelNorm} ${variantNorm}`;

  if (!mot) return true;
  if (mot === "c") return isCClassFamily(csvModel);

  if (/^\d{2,3}$/.test(mot)) {
    const engineRe = new RegExp(`\\b${mot}[a-z]{0,2}\\b`, "i");
    if (engineRe.test(variantNorm)) return true;
    if (new RegExp(`\\b${mot}\\b`, "i").test(modelNorm)) return true;
    return false;
  }

  const motTokens = tokenize(mot);
  if (motTokens.length === 0) return csvText.includes(mot);

  return motTokens.every((t) => {
    const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return re.test(csvText);
  });
}

function fuelMatchesStrict(csvFuel: string, dvlaFuel: string): boolean {
  const c = normalize(csvFuel);
  const d = normalize(dvlaFuel);
  if (!d) return true;
  if (!c) return false;
  if (d.includes("diesel")) return c.includes("diesel");
  if (d.includes("petrol")) return c.includes("petrol");
  if (d.includes("electric")) return c.includes("electric") || c.includes("hybrid");
  if (d.includes("hybrid")) return c.includes("hybrid");
  return c === d;
}

function productionWindowFit(
  registrationMs: number,
  prodStart: number,
  prodEnd: number
): ProductionWindowFit {
  if (registrationMs >= prodStart && registrationMs <= prodEnd) return "strict";
  if (registrationMs > prodEnd && registrationMs - prodEnd <= PRODUCTION_END_GRACE_MS) {
    return "grace";
  }
  return "none";
}

function rowProductionWindowFit(row: MakeSpecRecord, registrationMs: number | null): ProductionWindowFit {
  if (registrationMs == null) return "strict";

  const prodStart = parseDateMs(row.productionStart ?? undefined);
  const prodEnd = parseDateMs(row.productionEnd ?? undefined);
  if (prodStart == null || prodEnd == null) return "strict";

  return productionWindowFit(registrationMs, prodStart, prodEnd);
}

function rowMatchesYear(row: MakeSpecRecord, year: number, registrationMs: number | null): boolean {
  const inCatalogueYears = year >= row.yearFrom && (row.yearTo == null || year <= row.yearTo);
  if (!inCatalogueYears) return false;

  const fit = rowProductionWindowFit(row, registrationMs);
  return fit !== "none";
}

function co2Matches(row: MakeSpecRecord, co2: number): boolean {
  if (row.co2Min != null && row.co2Max != null) {
    return co2 >= row.co2Min && co2 <= row.co2Max;
  }
  if (row.co2Gkm != null) return Math.abs(row.co2Gkm - co2) <= 3;
  return false;
}

function co2Distance(row: MakeSpecRecord, co2: number): number | null {
  if (row.co2Gkm == null) return null;
  return Math.abs(row.co2Gkm - co2);
}

/** Same engine cc but multiple power bands (e.g. C 200 vs C 300 at 1991 cc). */
function hasAmbiguousPowerTiers(pool: MakeSpecRecord[]): boolean {
  const bhps = [...new Set(pool.map((r) => r.bhp).filter((b): b is number => b != null))].sort(
    (a, b) => a - b
  );
  if (bhps.length < 2) return false;
  return bhps[bhps.length - 1] - bhps[0] >= 15;
}

function applyCo2Narrowing(pool: MakeSpecRecord[], co2: number): MakeSpecRecord[] {
  const exact = pool.filter((row) => co2Matches(row, co2));
  if (exact.length > 0) return exact;

  if (!hasAmbiguousPowerTiers(pool)) return pool;

  const withCo2 = pool.filter((row) => row.co2Gkm != null);
  if (withCo2.length === 0) return pool;

  const minDist = Math.min(...withCo2.map((row) => co2Distance(row, co2)!));
  if (minDist > 12) return pool;

  const threshold = Math.max(3, minDist + 2);
  const nearest = withCo2.filter((row) => co2Distance(row, co2)! <= threshold);
  return nearest.length > 0 ? nearest : pool;
}

function hasPerformanceData(row: MakeSpecRecord): boolean {
  return (
    row.bhp != null ||
    row.torqueNm != null ||
    row.gearbox != null ||
    row.drivetrain != null ||
    row.acceleration0100 != null ||
    row.topSpeedMph != null
  );
}

function formatYearRange(yearFrom: number, yearTo: number | null): string {
  if (yearTo != null) return `${yearFrom}–${yearTo}`;
  return `${yearFrom}+`;
}

function formatCandidateLabel(row: MakeSpecRecord): string {
  const model = row.modelLabel ?? row.model;
  const variant = row.variantLabel ?? row.variant;
  return `${model} — ${variant} (${formatYearRange(row.yearFrom, row.yearTo)})`;
}

function rowToSpecCandidate(row: MakeSpecRecord): SpecCandidate {
  return {
    id: row.id ?? `${row.model}-${row.variant}-${row.yearFrom}`,
    label: formatCandidateLabel(row),
    makeLabel: row.makeLabel ?? null,
    modelLabel: row.modelLabel ?? null,
    seriesLabel: row.seriesLabel ?? null,
    variantLabel: row.variantLabel,
    yearFrom: row.yearFrom,
    yearTo: row.yearTo,
    bhp: row.bhp,
    torque: row.torqueNm,
    gearbox: row.gearbox,
    drivetrain: row.drivetrain,
    acceleration0100: row.acceleration0100,
    topSpeedMph: row.topSpeedMph,
    matchedVariant: row.variantLabel,
    engineCc: row.engineCc,
    cylinders: row.cylinders ?? null,
    valves: row.valves ?? null,
    fuel: row.fuel || null,
    transmission: row.transmission ?? null,
    co2Gkm: row.co2Gkm,
    euroStandard: row.euroStandard ?? null,
    newPrice: row.newPrice ?? null,
    mpg: row.mpg ?? null,
    insuranceGroup: row.insuranceGroup ?? null,
    fuelCapacity: row.fuelCapacity ?? null,
    batteryCapacity: row.batteryCapacity ?? null,
    weightKg: row.weightKg ?? null,
    lengthMm: row.lengthMm ?? null,
    widthMm: row.widthMm ?? null,
    heightMm: row.heightMm ?? null,
    wheelbaseMm: row.wheelbaseMm ?? null,
    doors: row.doors ?? null,
    seats: row.seats ?? null,
    luggageCapacity: row.luggageCapacity ?? null,
  };
}

function performanceFingerprint(row: MakeSpecRecord): string {
  return [
    row.bhp,
    row.torqueNm,
    row.engineCc,
    row.fuel,
    row.gearbox,
    row.drivetrain,
    row.acceleration0100,
    row.topSpeedMph,
  ].join("|");
}

function dedupeByPerformance(rows: MakeSpecRecord[]): MakeSpecRecord[] {
  const bestByKey = new Map<string, MakeSpecRecord>();
  for (const row of rows) {
    const key = performanceFingerprint(row);
    if (!bestByKey.has(key)) bestByKey.set(key, row);
  }
  return [...bestByKey.values()];
}

function scoreRow(row: MakeSpecRecord, params: SpecLookupParams, registrationMs: number | null): number {
  let score = 0;

  if (params.co2Emissions != null) {
    const dist = co2Distance(row, params.co2Emissions);
    if (dist != null) {
      if (dist <= 3) score += 40;
      else if (dist <= 12) score += Math.max(0, 28 - dist * 2);
    }
  }

  const windowFit = rowProductionWindowFit(row, registrationMs);
  if (windowFit === "grace") score -= 8;

  if (registrationMs != null) {
    const prodStart = parseDateMs(row.productionStart ?? undefined);
    const prodEnd = parseDateMs(row.productionEnd ?? undefined);
    if (prodStart != null && prodEnd != null) {
      const mid = (prodStart + prodEnd) / 2;
      const distMonths = Math.abs(registrationMs - mid) / MS_PER_MONTH;
      const timingScore = Math.max(0, 18 - distMonths * 2);
      score += windowFit === "grace" ? timingScore * 0.35 : timingScore;

      const windowMonths = (prodEnd - prodStart) / MS_PER_MONTH;
      score += Math.max(0, 12 - windowMonths / 3);
    }
  }

  if (params.revenueWeightKg != null && row.weightKgNum != null) {
    const dist = Math.abs(row.weightKgNum - params.revenueWeightKg);
    if (dist <= 150) score += Math.max(0, 15 - dist / 10);
  }

  return score;
}

function applyHierarchicalFilters(
  rows: MakeSpecRecord[],
  params: SpecLookupParams,
  year: number,
  registrationMs: number | null
): MakeSpecRecord[] {
  let pool = rows.filter(hasPerformanceData);

  if (params.fuelType) {
    pool = pool.filter((row) => fuelMatchesStrict(row.fuel, params.fuelType!));
  }

  pool = pool.filter((row) => matchesMotModel(row.model, row.variant, params.motModel));

  pool = pool.filter((row) => rowMatchesYear(row, year, registrationMs));

  if (params.engineCapacityCc != null && Number.isFinite(params.engineCapacityCc)) {
    pool = pool.filter((row) => row.engineCc === params.engineCapacityCc);
  }

  if (params.co2Emissions != null && Number.isFinite(params.co2Emissions)) {
    pool = applyCo2Narrowing(pool, params.co2Emissions);
  }

  if (params.revenueWeightKg != null && Number.isFinite(params.revenueWeightKg)) {
    const withWeight = pool.filter((row) => row.weightKgNum != null);
    const closeWeight = withWeight.filter(
      (row) => Math.abs(row.weightKgNum! - params.revenueWeightKg!) <= 150
    );
    if (closeWeight.length > 0) pool = closeWeight;
  }

  return pool;
}

/**
 * Return CSV variants narrowed by registration data for user selection.
 */
export function getSpecCandidates(params: SpecLookupParams): SpecCandidatesResult {
  const index = loadMakeIndex();
  const makeKey = resolveMakeIndexKey(params.make, index);
  const year = resolveVehicleYear(params);

  if (!makeKey || year == null) {
    return { candidates: [], suggestedId: null };
  }

  const rows = index[makeKey];
  if (!rows?.length) return { candidates: [], suggestedId: null };

  const registrationMs = resolveRegistrationMs(params);
  const filtered = applyHierarchicalFilters(rows, params, year, registrationMs);

  const scored = dedupeByPerformance(filtered)
    .map((row) => ({ row, score: scoreRow(row, params, registrationMs) }))
    .sort((a, b) => b.score - a.score);

  const candidates: SpecCandidate[] = scored.map(({ row }) => rowToSpecCandidate(row));
  const suggestedId = scored[0]?.row.id ?? candidates[0]?.id ?? null;

  return { candidates, suggestedId };
}

export function getSpecsById(make: string | undefined, candidateId: string): SpecCandidate | null {
  const index = loadMakeIndex();
  const makeKey = resolveMakeIndexKey(make, index);
  if (!makeKey || !candidateId) return null;

  const row = index[makeKey]?.find((r) => r.id === candidateId);
  if (!row || !hasPerformanceData(row)) return null;

  return rowToSpecCandidate(row);
}

export function getCarSpecs(params: SpecLookupParams): CarSpecs | null {
  const { candidates, suggestedId } = getSpecCandidates(params);
  const best = candidates.find((c) => c.id === suggestedId) ?? candidates[0];
  if (!best) return null;
  return {
    bhp: best.bhp,
    torque: best.torque,
    gearbox: best.gearbox,
    drivetrain: best.drivetrain,
    acceleration0100: best.acceleration0100,
    topSpeedMph: best.topSpeedMph,
    matchedVariant: best.matchedVariant,
  };
}
