const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const summary = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/vehicle-summary.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  { exports: summary, URL, Date, Intl },
);

function checkRoute(authState) {
  const candidate = {
    id: "private-spec",
    label: "Example variant",
    bhp: 125,
    euroStandard: 6,
  };
  const modules = {
    "next/server": {
      NextResponse: {
        json: (body, init) =>
          new Response(JSON.stringify(body), {
            ...init,
            headers: { "Content-Type": "application/json", ...init?.headers },
          }),
      },
    },
    "@/lib/car-specs-lookup": {
      getSpecCandidates: () => {
        return { candidates: [candidate], suggestedId: candidate.id };
      },
    },
    "@/lib/vehicle-summary": summary,
    "@/lib/rate-limit": {
      checkRateLimit: () => ({ allowed: true }),
      getClientIp: () => "127.0.0.1",
    },
    "@/lib/sample-vehicle-data": {
      isSampleRegistration: (registration) => registration === "SAMPLE",
      getSampleVehicleCheck: () => ({
        vehicle: {
          registrationNumber: "SAMPLE",
          make: "FORD",
          fuelType: "DIESEL",
          monthOfFirstRegistration: "2014-01",
        },
        motHistory: [],
        specCandidates: [candidate],
        suggestedSpecId: candidate.id,
        sample: true,
      }),
    },
    "@/lib/supabase/server": {
      createClient: async () => ({
        auth: {
          getUser: async () => {
            if (authState === "throws") throw new Error("Auth unavailable");
            return {
              data: {
                user: authState === "anonymous" ? null : { id: "test-user" },
              },
              error:
                authState === "error" ? new Error("Invalid session") : null,
            };
          },
        },
      }),
    },
  };
  const output = {};
  const code = ts.transpileModule(
    fs.readFileSync("app/api/check/route.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports: output,
    require: (name) => {
      assert(name in modules, `Unexpected route dependency: ${name}`);
      return modules[name];
    },
    process: { env: { DVLA_API_KEY: "test-key" } },
    URL,
    URLSearchParams,
    AbortSignal,
    Date,
    fetch: async (url) => {
      assert.equal(
        url,
        "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      );
      return new Response(
        JSON.stringify({
          registrationNumber: "AB12CDE",
          make: "FORD",
          fuelType: "DIESEL",
          monthOfFirstRegistration: "2014-01",
        }),
      );
    },
  });
  return {
    request: (method, registration) =>
      output[method]({
        nextUrl: new URL(
          `https://revveal.invalid/api/check?registration=${registration}`,
        ),
        json: async () => ({ registrationNumber: registration }),
      }),
  };
}

async function verifyResponses(route, unlocked) {
  for (const method of ["GET", "POST"]) {
    for (const registration of ["AB12CDE", "SAMPLE"]) {
      const response = await route.request(method, registration);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      const body = await response.json();
      assert.equal(body.vehicle.registrationNumber, registration);
      assert.equal(body.performanceUnlocked, unlocked);
      assert.equal(body.specCandidates.length, unlocked ? 1 : 0);
      assert.equal(body.suggestedSpecId, unlocked ? "private-spec" : null);
      assert.equal(body.ulezEstimate.state, "success");
      assert.equal(body.ulezEstimate.label, "Compliant");
      assert.match(body.ulezEstimate.detail, /catalogue estimate/i);
    }
  }
}

test("anonymous GET and POST checks withhold performance figures, including SAMPLE", async () => {
  const route = checkRoute("anonymous");
  await verifyResponses(route, false);
});

test("verified signed-in users receive performance candidates for GET and POST checks", async () => {
  const route = checkRoute("verified");
  await verifyResponses(route, true);
});

test("invalid sessions and authentication failures keep performance locked without breaking the free check", async () => {
  for (const state of ["error", "throws"]) {
    const route = checkRoute(state);
    await verifyResponses(route, false);
  }
});
