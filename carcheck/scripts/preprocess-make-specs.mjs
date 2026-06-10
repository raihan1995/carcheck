/**
 * Pre-process per-make specification CSVs into data/make-specs-index.json.
 *
 * Usage:
 *   npm run preprocess-specs
 *   SPECS_CSV_DIR="C:\path\to\specs" npm run preprocess-specs
 *
 * Expects files named: {make-key}-specifications.csv (e.g. mercedes-benz-specifications.csv)
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { createReadStream } from "fs";
import { parse } from "csv-parse";

const SPECS_DIR =
  process.env.SPECS_CSV_DIR || path.join(process.cwd(), "data", "specs");
const OUTPUT_JSON = path.join(process.cwd(), "data", "make-specs-index.json");

function normalize(s) {
  if (s == null || s === "") return "";
  return String(s).toLowerCase().trim().replace(/\s+/g, " ");
}

function num(s) {
  if (s == null || s === "") return null;
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function normalizeGearbox(raw) {
  const g = normalize(raw);
  if (!g) return null;
  if (g.includes("manual")) return "Manual";
  if (g === "dct" || g.includes("dct")) return "DCT";
  if (g.includes("automatic") || g === "at") return "Automatic";
  if (g.includes("semi")) return "Semi-automatic";
  return raw.trim() || null;
}

function normalizeDrivetrain(raw) {
  const d = normalize(raw);
  if (!d) return null;
  if (d.includes("4matic") || d === "awd") return "AWD";
  if (d === "rwd") return "RWD";
  if (d === "fwd") return "FWD";
  return raw.trim().toUpperCase() || null;
}

function makeKeyFromFilename(filename) {
  return filename.replace(/-specifications\.csv$/i, "").toLowerCase();
}

function rowId(makeKey, model, variant, yearFrom) {
  const raw = `${makeKey}|${model}|${variant}|${yearFrom}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

async function processCsv(filePath, makeKey) {
  const rows = [];
  let processed = 0;

  await new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        })
      )
      .on("data", (row) => {
        processed++;
        const yearFrom = num(row.yearFrom);
        if (yearFrom == null) return;

        const bhp = num(row.enginePowerBhp);
        const torqueNm = num(row.engineTorqueNm);
        const engineCc = num(row.engineDisplacement);
        const gearbox = normalizeGearbox(row.gearboxType);
        const drivetrain = normalizeDrivetrain(row.drivetrain);

        if (bhp == null && torqueNm == null && !gearbox && !drivetrain) return;

        const modelNorm = normalize(row.model);
        const variantNorm = normalize(row.variant);

        rows.push({
          id: rowId(makeKey, modelNorm, variantNorm, yearFrom),
          model: modelNorm,
          modelLabel: (row.model ?? "").trim() || null,
          variant: variantNorm,
          variantLabel: (row.variant ?? "").trim() || null,
          yearFrom,
          yearTo: num(row.yearTo),
          engineCc,
          fuel: normalize(row.engineFuelType),
          bhp,
          torqueNm,
          gearbox,
          drivetrain,
          acceleration0100: num(row.acceleration0100),
          topSpeedMph: num(row.topSpeedMph),
          co2Gkm: num(row.co2Gkm),
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.error(`  ${makeKey}: ${processed} rows read, ${rows.length} indexed`);
  return rows;
}

async function main() {
  if (!fs.existsSync(SPECS_DIR)) {
    console.error(`Specs directory not found: ${SPECS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SPECS_DIR)
    .filter((f) => f.endsWith("-specifications.csv"));

  if (files.length === 0) {
    console.error(`No *-specifications.csv files in ${SPECS_DIR}`);
    process.exit(1);
  }

  const index = {};
  for (const file of files) {
    const makeKey = makeKeyFromFilename(file);
    index[makeKey] = await processCsv(path.join(SPECS_DIR, file), makeKey);
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(index));
  const total = Object.values(index).reduce((n, arr) => n + arr.length, 0);
  console.error(`Wrote ${OUTPUT_JSON} (${Object.keys(index).length} makes, ${total} records)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
