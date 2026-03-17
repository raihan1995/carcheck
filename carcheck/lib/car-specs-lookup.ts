/**
 * Look up car specs (BHP, gearbox, etc.) from preprocessed Kaggle dataset using
 * DVLA-style data: make, model, year, engineCapacity (cc), fuelType.
 * Used server-side only (e.g. in API route).
 */

import fs from "fs";
import path from "path";

export type CarSpecs = {
  bhp: number | null;
  torque: number | null;
  gearbox: string | null;
  drivetrain: string | null;
};

type LookupRecord = {
  bhp?: number | null;
  transmission?: string | null;
  first_year_road_tax?: number | null;
};

let cachedLookup: Record<string, LookupRecord> | null = null;

function loadLookup(): Record<string, LookupRecord> {
  if (cachedLookup) return cachedLookup;
  const p = path.join(process.cwd(), "data", "car-specs-lookup.json");
  if (!fs.existsSync(p)) {
    cachedLookup = {};
    return cachedLookup;
  }
  const raw = fs.readFileSync(p, "utf8");
  cachedLookup = JSON.parse(raw) as Record<string, LookupRecord>;
  return cachedLookup;
}

function normalize(s: string | undefined): string {
  if (s == null || typeof s !== "string") return "";
  return s.toLowerCase().trim();
}

/** Round engine litres to 1 decimal for key matching (e.g. 1.998 -> 2.0). */
function engineLitresForKey(engineCapacityCc: number | undefined): number {
  if (engineCapacityCc == null || !Number.isFinite(engineCapacityCc)) return 0;
  const litres = engineCapacityCc / 1000;
  return Math.round(litres * 10) / 10;
}

/** Make variants for matching (e.g. "mercedes-benz" -> also try "mercedes"). */
function makeVariants(make: string): string[] {
  const n = normalize(make);
  if (!n) return [];
  const out = [n];
  const withoutSuffix = n.replace(/-benz$/, "").replace(/-uk$/, "").trim();
  if (withoutSuffix && withoutSuffix !== n) out.push(withoutSuffix);
  return out;
}

/**
 * Get specs from the Kaggle-derived lookup using make, model, year, engineCapacity (cc), fuelType.
 * Model can come from MOT when DVLA doesn't provide it.
 */
export function getCarSpecs(
  make: string | undefined,
  model: string | undefined,
  year: number | undefined,
  engineCapacityCc: number | undefined,
  fuelType: string | undefined
): CarSpecs | null {
  const lookup = loadLookup();
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
  // Try with exact engine litres (e.g. 1.998) in case dataset has finer precision
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
    return {
      bhp: rec.bhp ?? null,
      torque: null,
      gearbox: rec.transmission ?? null,
      drivetrain: null,
    };
  }
  return null;
}
