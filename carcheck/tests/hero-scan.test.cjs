const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const scan = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/hero-scan.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  { exports: scan },
);

test("scan labels use at most two words and oil leaks point to the engine bay", () => {
  const issues = scan.HERO_SCAN_ISSUES;
  assert.equal(new Set(issues.map((issue) => issue.id)).size, issues.length);
  for (const issue of issues) {
    assert(issue.label.trim().length > 0);
    assert(issue.label.trim().split(/\s+/).length <= 2, issue.label);
    assert(issue.area in scan.HERO_SCAN_AREAS, issue.label);
    const timing = scan.heroScanTiming(issue.area);
    assert(timing.delay > 0 && timing.duration > 0);
    assert(timing.delay + timing.duration < scan.HERO_SCAN_DURATION_MS);
  }
  assert.equal(
    issues.find((issue) => issue.label === "Oil leak").area,
    "engine",
  );
});

test("successive scans vary their findings, use distinct locations and never exceed three labels", () => {
  let seed = 0x51beef;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  let previous = [];
  const seen = new Set();
  const counts = new Set();
  for (let round = 0; round < 1000; round++) {
    const issues = scan.pickHeroScanIssues(previous, random);
    assert(issues.length >= 1 && issues.length <= 3);
    assert.equal(
      new Set(issues.map((issue) => issue.area)).size,
      issues.length,
    );
    assert.equal(new Set(issues.map((issue) => issue.id)).size, issues.length);
    for (const issue of issues) {
      assert(
        !previous.includes(issue.id),
        `${issue.label} repeated immediately`,
      );
      seen.add(issue.id);
    }
    counts.add(issues.length);
    previous = issues.map((issue) => issue.id);
  }
  assert.equal(counts.size, 3);
  assert.equal(seen.size, scan.HERO_SCAN_ISSUES.length);
});
