const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const exportsObject = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/vehicle-tax.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: exportsObject, Date },
);
const asOf = new Date("2026-11-25T12:00:00Z");
const estimate = (overrides = {}) =>
  exportsObject.getRoadTax(
    {
      registrationNumber: "TEST",
      typeApproval: "M1",
      monthOfFirstRegistration: "2019-03",
      fuelType: "PETROL",
      ...overrides,
    },
    asOf,
  );

test("post-2017 renewal costs use the standard rate independently of CO2", () => {
  for (const co2Emissions of [undefined, 0, 108, 300]) {
    const result = estimate({ co2Emissions });
    assert.equal(result.annual, 200);
    assert.equal(result.sixMonth, 110);
    assert.equal(result.monthlyTotal, 210);
    assert.equal(result.firstYear, null);
    assert.equal(result.supplementThreshold, null);
  }
});

test("2001-2017 costs change at CO2 band boundaries, including six-month availability", () => {
  for (const [co2Emissions, band, annual, sixMonth] of [
    [0, "A", 20, null],
    [100, "A", 20, null],
    [101, "B", 20, null],
    [110, "B", 20, null],
    [111, "C", 35, null],
    [120, "C", 35, null],
    [121, "D", 170, 93.5],
    [140, "E", 200, 110],
    [150, "F", 225, 123.75],
    [165, "G", 275, 151.25],
    [175, "H", 325, 178.75],
    [185, "I", 360, 198],
    [200, "J", 410, 225.5],
    [225, "K", 445, 244.75],
    [226, "L", 760, 418],
    [256, "M", 790, 434.5],
  ]) {
    const result = estimate({
      monthOfFirstRegistration: "2010-03",
      co2Emissions,
    });
    assert.equal(result.basis, `CO₂ band ${band}`);
    assert.equal(result.annual, annual);
    assert.equal(result.sixMonth, sixMonth);
  }
});

test("Band K cutoff requires the registration day during March 2006", () => {
  for (const [registration, annual] of [
    ["2006-02", 445],
    ["2006-03-22", 445],
    ["2006-03-23", 790],
    ["2006-04", 790],
  ]) {
    assert.equal(
      estimate({ monthOfFirstRegistration: registration, co2Emissions: 280 })
        .annual,
      annual,
    );
  }
  assert.equal(
    estimate({ monthOfFirstRegistration: "2006-03", co2Emissions: 280 }),
    null,
  );
  assert.equal(
    estimate({ monthOfFirstRegistration: "2006-03", co2Emissions: 200 }).annual,
    410,
  );
});

test("pre-2001 estimates require engine size and use the 1549cc boundary", () => {
  for (const [engineCapacity, annual, sixMonth] of [
    [1549, 230, 126.5],
    [1550, 375, 206.25],
  ]) {
    const result = estimate({
      monthOfFirstRegistration: "2001-02",
      engineCapacity,
    });
    assert.equal(result.annual, annual);
    assert.equal(result.sixMonth, sixMonth);
  }
  for (const engineCapacity of [undefined, 0, -1, NaN, Infinity]) {
    assert.equal(
      estimate({ monthOfFirstRegistration: "1999-06", engineCapacity }),
      null,
    );
  }
});

test("first-registration rates use the diesel RDE2 column and stop after the first year", () => {
  const recent = { monthOfFirstRegistration: "2026-05", co2Emissions: 108 };
  assert.equal(estimate(recent).firstYear, 405);
  assert.equal(estimate({ ...recent, fuelType: "DIESEL" }).firstYear, 455);
  assert.equal(
    estimate({ ...recent, fuelType: "DIESEL", realDrivingEmissions: "RDE2" })
      .firstYear,
    405,
  );
  assert.equal(
    estimate({ ...recent, co2Emissions: 0, fuelType: "ELECTRICITY" }).firstYear,
    10,
  );
  assert.equal(
    estimate({ ...recent, monthOfFirstRegistration: "2025-11" }).firstYear,
    null,
  );
  assert.equal(
    estimate({ ...recent, co2Emissions: undefined }).firstYear,
    null,
  );
});

test("supplement notes respect the five renewal years and zero-emission registration cutoff", () => {
  assert.equal(
    estimate({ monthOfFirstRegistration: "2025-05" }).supplementThreshold,
    40000,
  );
  assert.equal(
    estimate({ monthOfFirstRegistration: "2025-05", fuelType: "ELECTRICITY" })
      .supplementThreshold,
    50000,
  );
  assert.equal(
    estimate({ monthOfFirstRegistration: "2025-03", fuelType: "ELECTRICITY" })
      .supplementThreshold,
    null,
  );
  assert.equal(
    estimate({ monthOfFirstRegistration: "2020-11" }).supplementThreshold,
    null,
  );
});

test("missing, invalid or unsupported records never produce a guessed low tax rate", () => {
  for (const registration of [
    undefined,
    "",
    "invalid",
    "2019-13",
    "2019-02-29",
    "2026-12",
  ]) {
    assert.equal(estimate({ monthOfFirstRegistration: registration }), null);
  }
  for (const co2Emissions of [undefined, -1, NaN, Infinity]) {
    assert.equal(
      estimate({ monthOfFirstRegistration: "2010-03", co2Emissions }),
      null,
    );
  }
  assert.equal(estimate({ typeApproval: "L3" }), null);
  assert.equal(estimate({ typeApproval: "N1" }), null);
});
