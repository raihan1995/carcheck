/**
 * Pre-process data/UK-Cars.csv (Teoalida UK versions) into data/make-specs-index.json.
 *
 * Usage: npm run preprocess-uk-cars
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { createReadStream } from "fs";
import { parse } from "csv-parse";

const INPUT_CSV = path.join(process.cwd(), "data", "UK-Cars.csv");
const OUTPUT_JSON = path.join(process.cwd(), "data", "make-specs-index.json");

function normalize(s) {
  if (s == null || s === "") return "";
  return String(s).toLowerCase().trim().replace(/\s+/g, " ");
}

function parseNum(raw) {
  if (raw == null || raw === "") return null;
  const m = String(raw).match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return Number.isFinite(n) ? n : null;
}

function parseCo2(raw) {
  if (raw == null || raw === "") return { co2Gkm: null, co2Min: null, co2Max: null };
  const nums = String(raw).match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return { co2Gkm: null, co2Min: null, co2Max: null };
  const values = nums.map((n) => parseFloat(n)).filter(Number.isFinite);
  if (!values.length) return { co2Gkm: null, co2Min: null, co2Max: null };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { co2Gkm: (min + max) / 2, co2Min: min, co2Max: max };
}

function normalizeGearbox(transmission, gearbox) {
  const combined = normalize(`${transmission ?? ""} ${gearbox ?? ""}`);
  if (!combined) return null;
  if (combined.includes("manual")) return "Manual";
  if (combined.includes("dct")) return "DCT";
  if (combined.includes("automatic") || combined.includes("auto") || combined.includes("speed"))
    return "Automatic";
  if (combined.includes("semi")) return "Semi-automatic";
  const raw = String(gearbox ?? transmission ?? "").trim();
  return raw || null;
}

function normalizeDrivetrain(raw) {
  const d = normalize(raw);
  if (!d) return null;
  if (d.includes("4 wheel") || d.includes("4-wheel") || d.includes("awd") || d.includes("4wd"))
    return "AWD";
  if (d.includes("rear")) return "RWD";
  if (d.includes("front")) return "FWD";
  return String(raw).trim() || null;
}

function makeKeyFromMake(make) {
  return normalize(make).replace(/\s+/g, "-");
}

function rowId(makeKey, model, variant, yearFrom) {
  const raw = `${makeKey}|${model}|${variant}|${yearFrom}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function cleanLabel(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  return s || null;
}

async function main() {
  if (!fs.existsSync(INPUT_CSV)) {
    console.error(`Input not found: ${INPUT_CSV}`);
    process.exit(1);
  }

  const index = {};
  let processed = 0;
  let indexed = 0;

  await new Promise((resolve, reject) => {
    createReadStream(INPUT_CSV)
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
        const make = cleanLabel(row.Make);
        if (!make) return;

        const yearFrom = parseNum(row["Year start"]);
        if (yearFrom == null) return;

        const bhp = parseNum(row["Power (bhp)"]);
        const torqueNm = parseNum(row["Torque (Nm)"]);
        const engineCc = parseNum(row["Engine size (cc)"]);
        const gearbox = normalizeGearbox(row["Transmission"], row.Gearbox);
        const drivetrain = normalizeDrivetrain(row.Drivetrain);
        const co2 = parseCo2(row["CO2 emissions (g/km)"]);
        const weightKgNum = parseNum(row["Weight (kg)"]);

        if (bhp == null && torqueNm == null && !gearbox && !drivetrain && engineCc == null) return;

        const modelLabel = [row.Model, row["Series launch year"]].filter(Boolean).join(" — ");
        const modelNorm = normalize(`${row.Model ?? ""} ${row["Series launch year"] ?? ""}`);
        const variantLabel = cleanLabel(row["Trim / Version"]);
        const variantNorm = normalize(variantLabel ?? "");

        const makeKey = makeKeyFromMake(make);
        if (!index[makeKey]) index[makeKey] = [];

        index[makeKey].push({
          id: rowId(makeKey, modelNorm, variantNorm, yearFrom),
          make: normalize(make),
          makeLabel: make,
          model: modelNorm,
          modelLabel: modelLabel || null,
          seriesLabel: cleanLabel(row["Series launch year"]),
          variant: variantNorm,
          variantLabel,
          yearFrom,
          yearTo: parseNum(row["Year end"]),
          productionStart: cleanLabel(row["Production start"]),
          productionEnd: cleanLabel(row["Production end"]),
          engineCc,
          cylinders: parseNum(row.Cylinders),
          valves: parseNum(row.Valves),
          fuel: normalize(row["Fuel Type"]),
          bhp,
          torqueNm,
          gearbox,
          drivetrain,
          transmission: cleanLabel(row.Transmission),
          acceleration0100: parseNum(row["0-60 mph (secs)"]),
          topSpeedMph: parseNum(row["Top speed (mph)"]),
          co2Gkm: co2.co2Gkm,
          co2Min: co2.co2Min,
          co2Max: co2.co2Max,
          euroStandard: parseNum(row["Euro emissions standard"]),
          newPrice: cleanLabel(row["New price"]),
          mpg: cleanLabel(row["Miles per gallon"]),
          insuranceGroup: cleanLabel(row["Insurance group"]),
          fuelCapacity: cleanLabel(row["Fuel capacity (litres)"]),
          batteryCapacity: cleanLabel(row["Battery capacity (kWh)"]),
          weightKg: cleanLabel(row["Weight (kg)"]),
          weightKgNum,
          lengthMm: cleanLabel(row["Length (mm)"]),
          widthMm: cleanLabel(row["Width (mm)"]),
          heightMm: cleanLabel(row["Height (mm)"]),
          wheelbaseMm: cleanLabel(row["Wheelbase (mm)"]),
          doors: parseNum(row.Doors),
          seats: parseNum(row.Seats),
          luggageCapacity: cleanLabel(row["Luggage capacity (litres)"]),
        });
        indexed++;
      })
      .on("end", resolve)
      .on("error", reject);
  });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(index));
  const makes = Object.keys(index).length;
  console.error(`Read ${processed} CSV rows, indexed ${indexed} records across ${makes} makes`);
  console.error(`Wrote ${OUTPUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
