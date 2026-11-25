const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function load(file, context = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const result = {};
  vm.runInNewContext(code, { exports: result, URL, Date, Intl, ...context });
  return result;
}
const summary = load("lib/vehicle-summary.ts");
const auth = load("lib/auth/redirect.ts");

test("annual mileage bars use the latest reading, not the highest, and normalise units", () => {
  const annual = summary.yearlyMileageReadings([
    {
      completedDate: "2024-03-11T10:00:00Z",
      odometerValue: "10000",
      odometerUnit: "MI",
    },
    {
      completedDate: "2023-03-01T10:00:00Z",
      odometerValue: "10000",
      odometerUnit: "KM",
    },
    {
      completedDate: "2024-03-08T10:00:00Z",
      odometerValue: "11000",
      odometerUnit: "MI",
    },
  ]);
  assert.equal(annual.length, 2);
  assert.equal(annual[0].year, 2023);
  assert(Math.abs(annual[0].miles - 6213.7119) < 0.01);
  assert.equal(annual[1].year, 2024);
  assert.equal(annual[1].miles, 10000);
});

test("CO2 comparison boundaries include zero and never treat missing values as low emissions", () => {
  for (const [value, band] of [
    [0, "A"],
    [100, "A"],
    [101, "B–C"],
    [120, "B–C"],
    [121, "D–E"],
    [140, "D–E"],
    [141, "F–G"],
    [165, "F–G"],
    [166, "H–I"],
    [185, "H–I"],
    [186, "J–K"],
    [225, "J–K"],
    [226, "L–M"],
    [500, "L–M"],
  ])
    assert.equal(summary.co2ComparisonBand(value).label, band);
  for (const value of [undefined, null, -1, NaN, Infinity, "0"])
    assert.equal(summary.co2ComparisonBand(value), null);
});

test("MOT severity respects dangerous flags and legacy failure types", () => {
  assert.equal(
    summary.motDefectCategory({ type: "MINOR", dangerous: true }),
    "dangerous",
  );
  assert.equal(summary.motDefectCategory({ type: "DANGEROUS" }), "dangerous");
  assert.equal(summary.motDefectCategory({ type: "major" }), "major");
  assert.equal(summary.motDefectCategory({ type: "FAIL" }), "major");
  assert.equal(summary.motDefectCategory({ type: "MINOR" }), "minor");
  assert.equal(summary.motDefectCategory({ type: "ADVISORY" }), "advisory");
  assert.equal(summary.motDefectCategory({ type: "OTHER" }), "unknown");
});
test("SORN and invalid MOT statuses take precedence over renewal dates", () => {
  assert.equal(
    summary.taxSummary({
      registrationNumber: "AA19SRN",
      taxStatus: "SORN",
      taxDueDate: "2099-01-01",
    }).label,
    "SORN",
  );
  assert.equal(
    summary.motSummary({
      registrationNumber: "AA19SRN",
      motStatus: "Not valid",
      motExpiryDate: "2099-01-01",
    }).state,
    "danger",
  );
});
test("ULEZ distinguishes diesel hybrids, fully electric vehicles and unknown records", () => {
  assert.equal(
    summary.ulezSummary({
      registrationNumber: "TEST",
      fuelType: "ELECTRIC DIESEL",
      euroStatus: "EURO 5",
    }).state,
    "danger",
  );
  assert.equal(
    summary.ulezSummary({
      registrationNumber: "TEST",
      fuelType: "PETROL",
      monthOfFirstRegistration: "invalid",
    }).state,
    "unknown",
  );
  assert.equal(
    summary.ulezSummary({ registrationNumber: "TEST", fuelType: "ELECTRICITY" })
      .state,
    "success",
  );
});

test("ULEZ uses DVLA Euro first, then the suggested catalogue Euro, before registration dates", () => {
  const vehicle = {
    registrationNumber: "TEST",
    fuelType: "DIESEL",
    monthOfFirstRegistration: "2014-01",
  };
  assert.equal(
    summary.ulezSummary({ ...vehicle, euroStatus: "EURO 5" }, 6).state,
    "danger",
  );
  assert.equal(
    summary.ulezSummary({ ...vehicle, euroStatus: "EURO 6D-TEMP" }, 5).state,
    "success",
  );
  const matched = summary.ulezSummary(vehicle, 6);
  assert.equal(matched.label, "Compliant");
  assert.equal(matched.state, "success");
  assert.match(matched.detail, /catalogue estimate/i);
  assert.equal(
    summary.ulezSummary({ ...vehicle, euroStatus: "EURO 4" }).label,
    "Not compliant",
  );
});

test("ULEZ registration estimates retain petrol, diesel and motorcycle cutoffs and the older-diesel edge case", () => {
  for (const [fuelType, registration, typeApproval, state] of [
    ["PETROL", "2005-12", "M1", "danger"],
    ["PETROL", "2006-01", "M1", "success"],
    ["DIESEL", "2015-08", "M1", "unknown"],
    ["DIESEL", "2015-09", "M1", "success"],
    ["ELECTRIC DIESEL", "2014-01", "M1", "unknown"],
    ["ELECTRIC PETROL", "2006-01", "M1", "success"],
    ["PETROL", "2007-06", "L3E", "danger"],
    ["PETROL", "2007-07", "L3E", "success"],
  ]) {
    assert.equal(
      summary.ulezSummary({
        registrationNumber: "TEST",
        fuelType,
        typeApproval,
        monthOfFirstRegistration: registration,
      }).state,
      state,
    );
  }
  assert.equal(
    summary.ulezSummary({
      registrationNumber: "TEST",
      fuelType: "PETROL",
      typeApproval: "L3E",
      euroStatus: "EURO 3",
    }).state,
    "success",
  );
});

test("ULEZ keeps missing, malformed or ambiguous information amber", () => {
  for (const vehicle of [
    {},
    { fuelType: "PETROL", monthOfFirstRegistration: "2020-13" },
    { fuelType: "PETROL", monthOfFirstRegistration: "2020" },
    { fuelType: "DIESEL", monthOfFirstRegistration: "2014-01" },
    {
      fuelType: "HYBRID ELECTRIC",
      monthOfFirstRegistration: "2020-01",
      euroStatus: "EURO 5",
    },
  ]) {
    const status = summary.ulezSummary({
      registrationNumber: "TEST",
      ...vehicle,
    });
    assert.equal(status.label, "Unknown");
    assert.equal(status.state, "unknown");
  }
});
test("ISO timestamps with milliseconds and legacy dates both sort chronologically", () => {
  const newer = {
    completedDate: "2026-03-09T10:30:00.000Z",
    odometerValue: "100000",
    odometerUnit: "MI",
  };
  const older = {
    completedDate: "2025.03.09 10:30:00",
    odometerValue: "160000",
    odometerUnit: "KM",
  };
  assert(summary.testTime(newer) > summary.testTime(older));
  const readings = summary.mileageReadings([newer, older]);
  assert.equal(readings.length, 2);
  assert(
    readings[1].miles > readings[0].miles,
    "a change from KM to MI must not create a false rollback",
  );
});
test("readings with invalid values, unknown units or unreadable odometers are excluded", () => {
  assert.equal(
    summary.odometerMiles({ odometerValue: "", odometerUnit: "MI" }),
    null,
  );
  assert.equal(
    summary.odometerMiles({ odometerValue: "-1", odometerUnit: "MI" }),
    null,
  );
  assert.equal(
    summary.odometerMiles({ odometerValue: "100", odometerUnit: "UNKNOWN" }),
    null,
  );
  assert.equal(
    summary.odometerMiles({
      odometerValue: "100",
      odometerUnit: "MI",
      odometerResultType: "UNREADABLE",
    }),
    null,
  );
  assert(
    Math.abs(
      summary.odometerMiles({ odometerValue: "100000", odometerUnit: "KM" }) -
        62137.119,
    ) < 0.01,
  );
});
test("auth redirects keep internal paths and reject external or backslash destinations", () => {
  assert.equal(
    auth.safeRedirectPath("/dashboard/cars?view=all"),
    "/dashboard/cars?view=all",
  );
  for (const input of [
    "/\\evil.example",
    "//evil.example",
    "https://evil.example",
    "/\n/evil.example",
  ])
    assert.equal(auth.safeRedirectPath(input), "/dashboard");
});

test("saved cars survive the brand correction and subsequent garage updates", () => {
  const storage = new Map([
    [
      "motco_garage_v1",
      JSON.stringify({
        cars: [
          { registration: "AB12CDE", savedAt: "2026-11-25T12:00:00.000Z" },
        ],
        recent: [],
        reminders: [],
      }),
    ],
  ]);
  const garage = load("lib/browser-garage.ts", {
    require: (name) => {
      assert.equal(name, "react");
      return {
        useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
      };
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    window: { dispatchEvent: () => true },
    Event,
  });
  assert.equal(garage.useGarage().cars[0].registration, "AB12CDE");
  garage.updateGarage((data) => ({
    ...data,
    reminders: [
      { id: "mot", registration: "AB12CDE", kind: "MOT", due: "2027-01-01" },
    ],
  }));
  const saved = JSON.parse(storage.get("revveal_garage_v1"));
  assert.equal(saved.cars[0].registration, "AB12CDE");
  assert.equal(saved.reminders[0].due, "2027-01-01");
  assert.equal(garage.useGarage().reminders[0].due, "2027-01-01");
});
