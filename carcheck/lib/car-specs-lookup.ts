/**
 * Look up car performance specs from preprocessed per-make CSV data (primary)
 * with fallback to legacy Kaggle-derived JSON.
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

export type SpecCandidate = CarSpecs & {
  id: string;
  label: string;
};

export type SpecCandidatesResult = {
  candidates: SpecCandidate[];
  suggestedId: string | null;
};

type MakeSpecRecord = {
  id?: string;
  model: string;
  modelLabel?: string | null;
  variant: string;
  variantLabel: string | null;
  yearFrom: number;
  yearTo: number | null;
  engineCc: number | null;
  fuel: string;
  bhp: number | null;
  torqueNm: number | null;
  gearbox: string | null;
  drivetrain: string | null;
  acceleration0100: number | null;
  topSpeedMph: number | null;
  co2Gkm: number | null;
};

type MakeSpecsIndex = Record<string, MakeSpecRecord[]>;

type LegacyLookupRecord = {
  bhp?: number | null;
  transmission?: string | null;
  first_year_road_tax?: number | null;
};

const MAKE_INDEX_ALIASES: Record<string, string> = {
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  vw: "volkswagen",
};

let cachedMakeIndex: MakeSpecsIndex | null = null;
let cachedLegacyLookup: Record<string, LegacyLookupRecord> | null = null;

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

function loadLegacyLookup(): Record<string, LegacyLookupRecord> {
  if (cachedLegacyLookup) return cachedLegacyLookup;
  const p = path.join(process.cwd(), "data", "car-specs-lookup.json");
  if (!fs.existsSync(p)) {
    cachedLegacyLookup = {};
    return cachedLegacyLookup;
  }
  cachedLegacyLookup = JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, LegacyLookupRecord>;
  return cachedLegacyLookup;
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

function isCClassFamily(csvModel: string): boolean {
  const m = normalize(csvModel);
  if (!m.includes("c-class") && !m.includes("c class")) return false;
  if (m.includes("cla") && !m.includes("c-class")) return false;
  if (m.includes("glc") || m.includes("gla") || m.includes("slc")) return false;
  return true;
}

function matchesMotModel(csvModel: string, csvVariant: string, motModel: string | undefined): boolean {
  const mot = normalize(motModel ?? "");
  const csvText = `${csvModel} ${csvVariant}`;

  if (!mot) return true;

  if (mot === "c") return isCClassFamily(csvModel);

  if (mot.length <= 3) {
    return csvText.includes(mot) || csvModel.includes(mot);
  }

  const motTokens = tokenize(mot);
  if (motTokens.length === 0) {
    return csvText.includes(mot) || csvModel.includes(mot);
  }

  return motTokens.some((t) => csvText.includes(t));
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

function rowToCarSpecs(row: MakeSpecRecord): CarSpecs {
  return {
    bhp: row.bhp,
    torque: row.torqueNm,
    gearbox: row.gearbox,
    drivetrain: row.drivetrain,
    acceleration0100: row.acceleration0100,
    topSpeedMph: row.topSpeedMph,
    matchedVariant: row.variantLabel,
  };
}

function rowPassesCandidateFilters(
  row: MakeSpecRecord,
  year: number,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined,
  motModel: string | undefined
): boolean {
  const yearTo = row.yearTo ?? 9999;
  if (year < row.yearFrom || year > yearTo) return false;

  if (engineCapacityCc != null && Number.isFinite(engineCapacityCc)) {
    if (row.engineCc == null) return false;
    if (Math.abs(row.engineCc - engineCapacityCc) > 50) return false;
  }

  if (!fuelMatches(row.fuel, fuelType ?? "")) return false;

  if (!matchesMotModel(row.model, row.variant, motModel)) return false;

  return hasPerformanceData(row);
}

function fuelMatches(csvFuel: string, dvlaFuel: string): boolean {
  const c = normalize(csvFuel);
  const d = normalize(dvlaFuel);
  if (!c || !d) return true;
  if (c === d) return true;
  if (d.includes("diesel") && c.includes("diesel")) return true;
  if (d.includes("petrol") && c.includes("petrol")) return true;
  if (d.includes("electric") && (c.includes("electric") || c.includes("hybrid"))) return true;
  if (d.includes("hybrid") && (c.includes("hybrid") || c.includes("petrol") || c === "")) return true;
  return false;
}

function scoreMakeSpecRow(
  row: MakeSpecRecord,
  model: string,
  year: number,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined,
  co2: number | undefined
): number {
  const yearTo = row.yearTo ?? 9999;
  if (year < row.yearFrom || year > yearTo) return -1;

  let score = 25;

  if (row.engineCc != null && engineCapacityCc != null && Number.isFinite(engineCapacityCc)) {
    const diff = Math.abs(row.engineCc - engineCapacityCc);
    if (diff > 120) return -1;
    score += Math.max(0, 35 - diff / 3);
  } else if (row.engineCc == null && engineCapacityCc == null) {
    score += 8;
  } else {
    score -= 8;
  }

  const motTokens = tokenize(model);
  const csvText = `${row.model} ${row.variant}`;
  const csvTokens = new Set(tokenize(csvText));

  for (const token of motTokens) {
    if (token.length < 2 && !/^\d+$/.test(token)) continue;
    if (csvTokens.has(token)) score += 12;
    else if (csvText.includes(token)) score += 8;
  }

  const motNorm = normalize(model);
  const variantNorm = row.variant;
  if (/\b300\b/.test(motNorm) && /\b300\b/.test(variantNorm)) score += 20;
  if (/\b220\b/.test(motNorm) && /\b220\b/.test(variantNorm)) score += 20;
  if (/\b200\b/.test(motNorm) && /\b200\b/.test(variantNorm)) score += 15;
  if (motNorm.includes("mhev") && variantNorm.includes("mhev")) score += 18;
  if (motNorm.includes("amg") && variantNorm.includes("amg")) score += 10;
  if (motNorm.includes("4matic") && (variantNorm.includes("4matic") || variantNorm.includes("awd")))
    score += 12;

  if (fuelMatches(row.fuel, fuelType ?? "")) score += 10;

  if (
    co2 != null &&
    row.co2Gkm != null &&
    Number.isFinite(co2) &&
    Math.abs(row.co2Gkm - co2) <= 25
  ) {
    score += 8;
  }

  return score;
}

function getCarSpecsFromMakeIndex(
  make: string | undefined,
  model: string | undefined,
  year: number | undefined,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined,
  co2: number | undefined
): CarSpecs | null {
  const index = loadMakeIndex();
  const makeKey = resolveMakeIndexKey(make, index);
  if (!makeKey || year == null || !Number.isFinite(year)) return null;

  const rows = index[makeKey];
  if (!rows?.length) return null;

  const modelN = normalize(model ?? "");
  let best: MakeSpecRecord | null = null;
  let bestScore = 0;

  for (const row of rows) {
    const score = scoreMakeSpecRow(row, modelN, year, engineCapacityCc, fuelType, co2);
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }

  if (!best || bestScore < 30) return null;

  return {
    bhp: best.bhp,
    torque: best.torqueNm,
    gearbox: best.gearbox,
    drivetrain: best.drivetrain,
    acceleration0100: best.acceleration0100,
    topSpeedMph: best.topSpeedMph,
    matchedVariant: best.variantLabel,
  };
}

function engineLitresForKey(engineCapacityCc: number | undefined): number {
  if (engineCapacityCc == null || !Number.isFinite(engineCapacityCc)) return 0;
  const litres = engineCapacityCc / 1000;
  return Math.round(litres * 10) / 10;
}

function getCarSpecsLegacy(
  make: string | undefined,
  model: string | undefined,
  year: number | undefined,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined
): CarSpecs | null {
  const lookup = loadLegacyLookup();
  if (Object.keys(lookup).length === 0) return null;

  const makeN = normalize(make);
  const modelN = normalize(model ?? "");
  const yearN = year != null && Number.isFinite(year) ? Number(year) : null;
  const engineLitres = engineLitresForKey(engineCapacityCc);
  const fuelN = normalize(fuelType);

  if (!makeN || yearN == null) return null;

  const makesToTry = makeVariants(make ?? "");
  const keysToTry: string[] = [];
  for (const m of makesToTry) {
    keysToTry.push([m, modelN, yearN, engineLitres, fuelN].join("|"));
    keysToTry.push([m, "", yearN, engineLitres, fuelN].join("|"));
  }
  const exactLitres =
    engineCapacityCc != null && Number.isFinite(engineCapacityCc)
      ? engineCapacityCc / 1000
      : 0;
  if (exactLitres !== engineLitres && makesToTry.length > 0) {
    const m = makesToTry[0];
    keysToTry.push([m, modelN, yearN, exactLitres, fuelN].join("|"));
    keysToTry.push([m, "", yearN, exactLitres, fuelN].join("|"));
  }

  for (const key of keysToTry) {
    const rec = lookup[key];
    if (!rec) continue;
    const gearbox = rec.transmission
      ? rec.transmission.charAt(0).toUpperCase() + rec.transmission.slice(1)
      : null;
    return {
      bhp: rec.bhp ?? null,
      torque: null,
      gearbox,
      drivetrain: null,
      acceleration0100: null,
      topSpeedMph: null,
      matchedVariant: null,
    };
  }
  return null;
}

/**
 * Return CSV variants narrowed by registration data for user selection.
 */
export function getSpecCandidates(
  make: string | undefined,
  model: string | undefined,
  year: number | undefined,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined,
  co2Emissions?: number
): SpecCandidatesResult {
  const index = loadMakeIndex();
  const makeKey = resolveMakeIndexKey(make, index);
  if (!makeKey || year == null || !Number.isFinite(year)) {
    return { candidates: [], suggestedId: null };
  }

  const rows = index[makeKey];
  if (!rows?.length) return { candidates: [], suggestedId: null };

  const modelN = normalize(model ?? "");
  const filtered = rows.filter((row) =>
    rowPassesCandidateFilters(row, year, engineCapacityCc, fuelType, model)
  );

  const scored = filtered.map((row) => ({
    row,
    score: scoreMakeSpecRow(row, modelN, year, engineCapacityCc, fuelType, co2Emissions),
  }));

  scored.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    return formatCandidateLabel(a.row).localeCompare(formatCandidateLabel(b.row));
  });

  const candidates: SpecCandidate[] = scored.map(({ row }) => ({
    id: row.id ?? `${makeKey}-${row.model}-${row.variant}-${row.yearFrom}`,
    label: formatCandidateLabel(row),
    ...rowToCarSpecs(row),
  }));

  const best = scored[0];
  const suggestedId =
    best && best.score >= 30 && best.row.id
      ? best.row.id
      : (candidates[0]?.id ?? null);

  return { candidates, suggestedId };
}

/**
 * Look up performance specs for a user-selected candidate id.
 */
export function getSpecsById(make: string | undefined, candidateId: string): CarSpecs | null {
  const index = loadMakeIndex();
  const makeKey = resolveMakeIndexKey(make, index);
  if (!makeKey || !candidateId) return null;

  const row = index[makeKey]?.find((r) => r.id === candidateId);
  if (!row || !hasPerformanceData(row)) return null;

  return rowToCarSpecs(row);
}

/**
 * Get specs using per-make CSV index (primary) or legacy Kaggle JSON (fallback).
 */
export function getCarSpecs(
  make: string | undefined,
  model: string | undefined,
  year: number | undefined,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined,
  co2Emissions?: number
): CarSpecs | null {
  const fromMake =
    getCarSpecsFromMakeIndex(make, model, year, engineCapacityCc, fuelType, co2Emissions) ??
    null;
  if (fromMake) return fromMake;
  return getCarSpecsLegacy(make, model, year, engineCapacityCc, fuelType);
}
