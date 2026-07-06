/**
 * Model-line index from Honest John-style make/model year ranges.
 * Narrows UK-Cars rows by generation era (year overlap), not body-style text.
 * MOT model matching happens earlier; fuel/cc/CO₂ narrow trim after this step.
 */

import fs from "fs";
import path from "path";

export type ModelLineCategory = "new cars" | "used cars" | "classics";

export type ModelLine = {
  id: string;
  displayName: string;
  motTokens: string[];
  bodyStyle: string | null;
  yearFrom: number;
  yearTo: number | null;
  category: string;
  fuelExclude: string[];
  csvSeriesHints: string[];
};

export type MakeModelLines = {
  makeLabel: string;
  lines: ModelLine[];
};

export type ModelLinesIndex = Record<string, MakeModelLines>;

const MAKE_INDEX_ALIASES: Record<string, string> = {
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  vw: "volkswagen",
  "land rover": "land-rover",
  "range rover": "range-rover",
  "aston martin": "aston-martin",
  "alfa romeo": "alfa-romeo",
};

let cachedIndex: ModelLinesIndex | null = null;

function normalize(s: string | undefined): string {
  if (s == null || typeof s !== "string") return "";
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function makeVariants(make: string): string[] {
  const n = normalize(make);
  if (!n) return [];
  const out = new Set<string>();
  out.add(n);
  out.add(n.replace(/\s+/g, "-"));
  out.add(n.replace(/-/g, " "));
  return [...out].filter(Boolean);
}

export function resolveModelLinesMakeKey(
  make: string | undefined,
  index: ModelLinesIndex
): string | null {
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

function lineActiveInYear(line: ModelLine, year: number): boolean {
  const end = line.yearTo ?? 9999;
  return year >= line.yearFrom && year <= end;
}

function yearsOverlap(
  lineFrom: number,
  lineTo: number | null,
  rowFrom: number,
  rowTo: number | null
): boolean {
  const lineEnd = lineTo ?? 9999;
  const rowEnd = rowTo ?? rowFrom;
  return lineFrom <= rowEnd && rowFrom <= lineEnd;
}

function motMatchesLine(motModel: string | undefined, line: ModelLine): boolean {
  const mot = normalize(motModel ?? "");
  if (!mot) return true;

  const motTokens = mot
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 2 || /^\d+$/.test(t));

  if (motTokens.length === 0) {
    return line.motTokens.some((t) => mot.includes(t) || t.includes(mot));
  }

  const primary = line.motTokens[0];
  if (primary && !mot.includes(primary) && !motTokens.some((t) => t === primary || primary.startsWith(t))) {
    const display = normalize(line.displayName);
    if (!motTokens.every((t) => display.includes(t))) return false;
  }

  return motTokens.every((t) => {
    const display = normalize(line.displayName);
    if (display.includes(t)) return true;
    return line.motTokens.some((mt) => mt.includes(t) || t.includes(mt));
  });
}

function fuelExcludedForLine(line: ModelLine, fuelType: string | undefined): boolean {
  if (!fuelType) return false;
  const fuel = normalize(fuelType);
  const display = normalize(line.displayName);

  if (fuel.includes("electric") && !fuel.includes("hybrid")) {
    return !display.includes("e-tron") && !display.includes("electric") && !display.includes("elettrica");
  }
  if (fuel.includes("petrol") || fuel.includes("diesel")) {
    if (display.includes("e-tron") || display.includes("elettrica")) return true;
  }
  if (!line.fuelExclude.length) return false;

  if (line.fuelExclude.some((ex) => fuel.includes(ex))) return false;
  return false;
}

export function resolveEligibleModelLines(
  make: string | undefined,
  motModel: string | undefined,
  year: number | null,
  fuelType: string | undefined
): ModelLine[] {
  if (year == null) return [];

  const index = loadModelLinesIndex();
  const makeKey = resolveModelLinesMakeKey(make, index);
  if (!makeKey) return [];

  const entry = index[makeKey];
  if (!entry?.lines?.length) return [];

  return entry.lines.filter(
    (line) =>
      lineActiveInYear(line, year) &&
      motMatchesLine(motModel, line) &&
      !fuelExcludedForLine(line, fuelType)
  );
}

export function loadModelLinesIndex(): ModelLinesIndex {
  if (cachedIndex) return cachedIndex;
  const p = path.join(process.cwd(), "data", "model-lines-index.json");
  if (!fs.existsSync(p)) {
    cachedIndex = {};
    return cachedIndex;
  }
  cachedIndex = JSON.parse(fs.readFileSync(p, "utf8")) as ModelLinesIndex;
  return cachedIndex;
}

type CatalogueYearRow = {
  yearFrom?: number;
  yearTo?: number | null;
};

/** UK-Cars catalogue years overlap any eligible model-line era (union across sibling bodies). */
export function rowOverlapsEligibleModelLines(
  row: CatalogueYearRow,
  lines: ModelLine[]
): boolean {
  const rowFrom = row.yearFrom;
  if (rowFrom == null || !Number.isFinite(rowFrom)) return false;
  const rowTo = row.yearTo ?? rowFrom;

  return lines.some((line) => yearsOverlap(line.yearFrom, line.yearTo, rowFrom, rowTo));
}

export function filterRowsByModelLines<T extends CatalogueYearRow>(
  rows: T[],
  lines: ModelLine[]
): T[] {
  if (!lines.length) return rows;

  const filtered = rows.filter((row) => rowOverlapsEligibleModelLines(row, lines));

  return filtered.length > 0 ? filtered : rows;
}
