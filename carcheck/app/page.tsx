"use client";

import { useState, FormEvent } from "react";

type VehicleData = {
  registrationNumber: string;
  make?: string;
  colour?: string;
  fuelType?: string;
  co2Emissions?: number;
  engineCapacity?: number;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  motStatus?: string;
  taxStatus?: string;
  taxDueDate?: string;
  artEndDate?: string;
  markedForExport?: boolean;
  typeApproval?: string;
  revenueWeight?: number;
  wheelplan?: string;
  euroStatus?: string;
  realDrivingEmissions?: string;
  dateOfLastV5CIssued?: string;
};

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}

export default function Home() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const vrn = plate.trim();
    if (!vrn) {
      setError("Enter a registration number");
      return;
    }
    setError(null);
    setVehicle(null);
    setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: vrn }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.mock && data.demo) {
          setVehicle(data.mock);
          setIsDemo(true);
        } else {
          setError(data.error || "Check failed");
        }
        return;
      }
      setVehicle(data);
      setIsDemo(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const displayFields: (keyof VehicleData)[] = [
    "make",
    "colour",
    "fuelType",
    "yearOfManufacture",
    "monthOfFirstRegistration",
    "engineCapacity",
    "co2Emissions",
    "motStatus",
    "taxStatus",
    "taxDueDate",
    "markedForExport",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            UK Car Check
          </h1>
          <p className="mt-2 text-slate-400 text-lg">
            Enter a UK number plate to view vehicle details
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-6 sm:p-8 shadow-xl"
        >
          <label htmlFor="plate" className="block text-sm font-medium text-slate-300 mb-2">
            Registration number
          </label>
          <div className="flex gap-3">
            <input
              id="plate"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="e.g. AB12 CDE"
              className="flex-1 rounded-xl bg-slate-900/80 border border-slate-600 text-white placeholder-slate-500 px-4 py-3.5 text-lg font-mono tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              disabled={loading}
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </form>

        {vehicle && (
          <section
            className="mt-8 rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden shadow-xl"
            aria-labelledby="vehicle-results"
          >
            {isDemo && (
              <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 text-amber-200 text-sm">
                Demo data — add <code className="bg-slate-800 px-1.5 py-0.5 rounded">DVLA_API_KEY</code> to get real results from the DVLA.
              </div>
            )}
            <h2 id="vehicle-results" className="sr-only">
              Vehicle details
            </h2>
            <div className="p-6 sm:p-8">
              <div className="mb-6 pb-4 border-b border-slate-600/60">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">
                  Registration
                </p>
                <p className="text-2xl font-mono font-bold tracking-widest text-white">
                  {vehicle.registrationNumber.length <= 7
                    ? vehicle.registrationNumber.replace(/(.{4})/g, "$1 ").trim()
                    : vehicle.registrationNumber}
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                {displayFields.map((key) => {
                  const value = vehicle[key];
                  if (value === undefined && key !== "markedForExport") return null;
                  return (
                    <div key={key} className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wider text-slate-500">
                        {formatLabel(key)}
                      </dt>
                      <dd className="text-slate-100 font-medium">
                        {formatValue(value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>
            Data from the DVLA Vehicle Enquiry Service. For official use only.
          </p>
        </footer>
      </div>
    </div>
  );
}
