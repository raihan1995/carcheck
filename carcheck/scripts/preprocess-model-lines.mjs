/**
 * Parse Honest John-style model line lists into data/model-lines-index.json.
 *
 * Source: data/model-lines/source/car-reviews-2026.txt
 * Usage: npm run preprocess-model-lines
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const SOURCE_TXT = path.join(process.cwd(), "data", "model-lines", "source", "car-reviews-2026.txt");
const SPECS_INDEX = path.join(process.cwd(), "data", "make-specs-index.json");
const OUTPUT_JSON = path.join(process.cwd(), "data", "model-lines-index.json");

const MAKE_ALIASES = {
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  vw: "volkswagen",
  "land rover": "land-rover",
  "range rover": "range-rover",
  "aston martin": "aston-martin",
  "alfa romeo": "alfa-romeo",
  mini: "mini",
};

const BODY_VARIANTS = [
  "sportback",
  "saloon",
  "cabriolet",
  "avant",
  "allroad",
  "roadster",
  "coupe",
  "estate",
  "touring",
  "citycarver",
  "gran turismo",
  "spider",
  "convertible",
];

const SECTION_HEADERS = new Set(["new cars", "used cars", "classics"]);

const NOISE_EXACT = new Set([
  "car reviews 2026",
  "honest john reviews",
  "cars vans classics good garage guide kit",
  "search",
  "sign up",
  "log in",
  "honest john",
  "reviews",
  "best cars to buy",
  "ask hj",
  "real mpg",
  "news",
  "advice",
  "help & tools",
  "free car valuation",
  "cars for sale",
  "new account",
  "log in",
  "new account",
]);

function normalize(s) {
  if (s == null) return "";
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-");
}

function collapseSpaces(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

function makeKeyFromName(makeName) {
  const n = normalize(makeName);
  return MAKE_ALIASES[n] ?? n.replace(/\s+/g, "-");
}

function isNoiseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  const n = normalize(trimmed);
  if (NOISE_EXACT.has(n)) return true;
  if (SECTION_HEADERS.has(n)) return false;
  if (n.endsWith(" reviews") && n !== "honest john reviews" && n !== "car reviews 2026") return false;
  if (n.startsWith("terms and conditions")) return true;
  if (n.startsWith("newspress website")) return true;
  if (/^sign up\s+log in/i.test(trimmed)) return true;
  if (n === "mobile privacy settings") return true;
  return false;
}

function parseModelLine(line) {
  const collapsed = collapseSpaces(line);
  const used = collapsed.match(/^(.+?)\s*\((\d{4})\s*-\s*(\d{4})\)$/);
  if (used) {
    return {
      displayName: used[1].trim(),
      yearFrom: Number(used[2]),
      yearTo: Number(used[3]),
    };
  }
  const current = collapsed.match(/^(.+?)\s*\((\d{4})\s+on\)$/i);
  if (current) {
    return {
      displayName: current[1].trim(),
      yearFrom: Number(current[2]),
      yearTo: null,
    };
  }
  return null;
}

function extractMotTokens(displayName) {
  const n = normalize(displayName);
  const tokens = [];
  const primary = n.match(/^[a-z0-9][a-z0-9-]*/);
  if (primary) tokens.push(primary[0]);
  if (n.includes("e-tron")) tokens.push("e-tron");
  return [...new Set(tokens)];
}

function extractBodyStyle(displayName) {
  const n = normalize(displayName);
  for (const body of BODY_VARIANTS) {
    if (n.includes(body)) return body.replace(/\s+/g, " ");
  }
  return null;
}

function fuelExcludeForLine(displayName) {
  const n = normalize(displayName);
  const excludes = [];
  if (n.includes("e-tron") || n.includes("elettrica") || n.includes("electric")) {
    return [];
  }
  excludes.push("electric");
  if (!n.includes("hybrid") && !n.includes("phev")) {
    excludes.push("hybrid", "phev", "plug-in");
  }
  return excludes;
}

function lineId(makeKey, displayName, yearFrom, yearTo, category) {
  const raw = `${makeKey}|${normalize(displayName)}|${yearFrom}|${yearTo ?? ""}|${category}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 12);
}

function yearsOverlap(aFrom, aTo, bFrom, bTo) {
  const aEnd = aTo ?? 9999;
  const bEnd = bTo ?? 9999;
  return aFrom <= bEnd && bFrom <= aEnd;
}

function lineYearContains(line, year) {
  const end = line.yearTo ?? 9999;
  return year >= line.yearFrom && year <= end;
}

function displayTokens(displayName) {
  return normalize(displayName)
    .split(/[\s/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** Hint build: catalogue Year start/end overlaps this model-line era (no body-text filter). */
function rowMatchesLine(line, row) {
  if (row.yearFrom == null) return false;
  return yearsOverlap(
    line.yearFrom,
    line.yearTo,
    row.yearFrom,
    row.yearTo ?? row.yearFrom
  );
}

function buildCsvSeriesHints(line, specRows) {
  const hints = new Set();
  for (const row of specRows) {
    if (rowMatchesLine(line, row) && row.model) {
      hints.add(normalize(row.model));
    }
  }
  return [...hints].sort();
}

function parseSourceFile(text) {
  const index = {};
  let currentMake = null;
  let currentMakeKey = null;
  let category = "used";
  const seenLineKeys = new Map();

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const lower = normalize(line);
    if (SECTION_HEADERS.has(lower)) {
      category = lower.replace(/\s+/g, " ");
      continue;
    }

    const makeMatch = line.match(/^(.+?) Reviews$/);
    if (makeMatch && lower !== "honest john reviews" && lower !== "car reviews 2026") {
      currentMake = makeMatch[1].trim();
      currentMakeKey = makeKeyFromName(currentMake);
      if (!index[currentMakeKey]) {
        index[currentMakeKey] = {
          makeLabel: currentMake,
          lines: [],
        };
      }
      continue;
    }

    if (isNoiseLine(line)) continue;
    if (!currentMakeKey) continue;

    const parsed = parseModelLine(line);
    if (!parsed) continue;

    const dedupeKey = `${normalize(parsed.displayName)}|${parsed.yearFrom}|${parsed.yearTo ?? "on"}|${category}`;
    if (seenLineKeys.has(`${currentMakeKey}|${dedupeKey}`)) continue;
    seenLineKeys.set(`${currentMakeKey}|${dedupeKey}`, true);

    const bodyStyle = extractBodyStyle(parsed.displayName);
    index[currentMakeKey].lines.push({
      id: lineId(currentMakeKey, parsed.displayName, parsed.yearFrom, parsed.yearTo, category),
      displayName: parsed.displayName,
      motTokens: extractMotTokens(parsed.displayName),
      bodyStyle,
      yearFrom: parsed.yearFrom,
      yearTo: parsed.yearTo,
      category,
      fuelExclude: fuelExcludeForLine(parsed.displayName),
      csvSeriesHints: [],
    });
  }

  return index;
}

function loadSpecIndex() {
  if (!fs.existsSync(SPECS_INDEX)) return {};
  return JSON.parse(fs.readFileSync(SPECS_INDEX, "utf8"));
}

function enrichWithCsvHints(index, specIndex) {
  for (const [makeKey, entry] of Object.entries(index)) {
    const specRows = specIndex[makeKey] ?? [];
    for (const line of entry.lines) {
      line.csvSeriesHints = buildCsvSeriesHints(line, specRows);
    }
  }
}

function main() {
  if (!fs.existsSync(SOURCE_TXT)) {
    console.error(`Source not found: ${SOURCE_TXT}`);
    process.exit(1);
  }

  const text = fs.readFileSync(SOURCE_TXT, "utf8");
  const index = parseSourceFile(text);
  const specIndex = loadSpecIndex();
  enrichWithCsvHints(index, specIndex);

  let totalLines = 0;
  let withHints = 0;
  for (const entry of Object.values(index)) {
    totalLines += entry.lines.length;
    withHints += entry.lines.filter((l) => l.csvSeriesHints.length > 0).length;
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(index));
  console.log(`Wrote ${OUTPUT_JSON}`);
  console.log(`Makes: ${Object.keys(index).length}, model lines: ${totalLines}`);
  console.log(`Lines with CSV hints: ${withHints}/${totalLines}`);
}

main();
