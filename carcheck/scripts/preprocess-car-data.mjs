/**
 * Pre-process Kaggle all_car_adverts.csv into a small lookup JSON keyed by
 * make|model|year|engine_vol|fuel for use with DVLA data (match on make, model, year, engine cc/1000, fuel).
 *
 * Usage:
 *   node scripts/preprocess-car-data.mjs
 *   INPUT_CSV="C:\path\to\all_car_adverts.csv" node scripts/preprocess-car-data.mjs
 *
 * Output: data/car-specs-lookup.json
 */

import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import { parse } from "csv-parse";

const INPUT_CSV =
  process.env.INPUT_CSV ||
  "C:\\Users\\Raihan\\Downloads\\kaggle\\all_car_adverts.csv";
const OUTPUT_JSON = path.join(process.cwd(), "data", "car-specs-lookup.json");

function normalize(s) {
  if (s == null || s === "") return "";
  return String(s).toLowerCase().trim();
}

function num(s) {
  if (s == null || s === "") return null;
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

const lookup = new Map();
let processed = 0;
let skipped = 0;

const parser = createReadStream(INPUT_CSV).pipe(
  parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  })
);

parser.on("data", (row) => {
  processed++;
  if (processed % 100000 === 0) {
    console.error(`Processed ${processed} rows...`);
  }

  const make = normalize(row.make);
  const model = normalize(row.model);
  const yearRaw = row.year;
  const year = num(yearRaw);
  const engineVol = num(row.engine_vol);
  const fuel = normalize(row.feul_type || row.fuel_type || "");

  if (!make || !model || year == null) {
    skipped++;
    return;
  }

  // Key: match DVLA-style lookup (engine in litres; DVLA gives cc so we use engineVol as litres)
  const engineLitres = engineVol != null ? engineVol : 0;
  const key = [make, model, year, engineLitres, fuel].join("|");

  // Prefer keeping an entry with BHP; otherwise keep first
  const engineSize = num(row.engine_size);
  const engineUnit = normalize(row.engine_size_unit);
  const bhp = engineUnit === "bhp" && engineSize != null ? engineSize : null;
  const transmission = normalize(row.transmission) || null;
  const roadTax = num(row.first_year_road_tax);

  const existing = lookup.get(key);
  const candidate = {
    bhp: bhp ?? existing?.bhp ?? null,
    transmission: transmission || existing?.transmission || null,
    first_year_road_tax: roadTax != null ? roadTax : existing?.first_year_road_tax ?? null,
  };

  // Keep entry with BHP if we have one; else keep first
  if (!existing || (bhp != null && existing.bhp == null)) {
    lookup.set(key, candidate);
  }
});

parser.on("error", (err) => {
  console.error("Parse error:", err);
  process.exit(1);
});

parser.on("end", () => {
  console.error(`Done. Processed ${processed} rows, skipped ${skipped}, ${lookup.size} unique keys.`);

  const outDir = path.dirname(OUTPUT_JSON);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const obj = Object.fromEntries(lookup);
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(obj), "utf8");
  const sizeMb = (fs.statSync(OUTPUT_JSON).size / 1024 / 1024).toFixed(2);
  console.error(`Written ${OUTPUT_JSON} (${sizeMb} MB).`);
});
