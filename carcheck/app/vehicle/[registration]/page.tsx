"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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
};

type MotTestItem = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: string;
  odometerUnit?: string;
  motTestNumber?: string;
  rfrAndComments?: Array<{ text: string; type: string; dangerous?: boolean }>;
  defects?: Array<{ text: string; type: string; dangerous?: boolean }>;
};

type MotHistoryVehicle = {
  registration?: string;
  make?: string;
  model?: string;
  fuelType?: string;
  primaryColour?: string;
  engineSize?: string;
  motTests?: MotTestItem[];
};

type ApiResponse = {
  vehicle: VehicleData;
  motHistory: MotHistoryVehicle[] | null;
  demo?: boolean;
  error?: string;
};

function formatDate(str: string | undefined): string {
  if (!str) return "—";
  // Handle ISO (e.g. 2025-04-24T14:00:32.000Z) or legacy (e.g. 2013.11.03 09:33:08)
  const datePart = str.includes("T") ? str.split("T")[0] : str.split(" ")[0]?.replace(/\./g, "-");
  if (!datePart) return str;
  try {
    return new Date(datePart).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default function VehiclePage() {
  const params = useParams();
  const router = useRouter();
  const registration = typeof params.registration === "string" ? params.registration : "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registration) {
      setLoading(false);
      setError("Missing registration.");
      return;
    }

    let cancelled = false;

    async function fetchVehicle() {
      try {
        const res = await fetch(
          `/api/check?registration=${encodeURIComponent(registration)}`
        );
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(json.error || "Could not load vehicle details.");
          setData(null);
          return;
        }

        setData(json);
        setError(null);
      } catch {
        if (!cancelled) {
          setError("Network error. Please try again.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVehicle();
    return () => {
      cancelled = true;
    };
  }, [registration]);

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

  function formatValue(value: unknown): string {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Loading vehicle details…</p>
          <div className="mt-4 h-1 w-48 mx-auto bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-amber-500 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.vehicle) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-slate-100 border border-slate-200 p-8 text-center">
          <p className="text-red-600 text-lg mb-6">{error || "Vehicle not found."}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
          >
            Check another vehicle
          </Link>
        </div>
      </div>
    );
  }

  const { vehicle, motHistory, demo } = data;
  const primaryMot = motHistory?.[0];
  const motTests = primaryMot?.motTests ?? [];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 text-sm mb-8 transition-colors"
        >
          ← Back to check another vehicle
        </Link>

        {demo && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
            Demo data — add <code className="bg-slate-200 px-1.5 py-0.5 rounded">DVLA_API_KEY</code> and MOT credentials to your <code className="bg-slate-200 px-1.5 py-0.5 rounded">.env</code> for real results.
          </div>
        )}

        <header className="rounded-2xl bg-slate-100 border border-slate-200 p-6 sm:p-8 mb-6">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-1">
            Registration
          </p>
          <h1 className="text-3xl font-mono font-bold tracking-widest text-slate-900">
            {vehicle.registrationNumber.length <= 7
              ? vehicle.registrationNumber.replace(/(.{4})/g, "$1 ").trim()
              : vehicle.registrationNumber}
          </h1>
          {vehicle.make && (
            <p className="mt-2 text-xl text-slate-600">
              {vehicle.make}
              {vehicle.colour && ` · ${vehicle.colour}`}
            </p>
          )}
        </header>

        <section className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden mb-6">
          <h2 className="px-6 py-4 border-b border-slate-200 text-lg font-semibold text-slate-900">
            Vehicle details
          </h2>
          <dl className="p-6 grid gap-4 sm:grid-cols-2">
            {displayFields.map((key) => {
              const value = vehicle[key];
              if (value === undefined && key !== "markedForExport") return null;
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    {formatLabel(key)}
                  </dt>
                  <dd className="text-slate-900 font-medium">
                    {formatValue(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden mb-6">
          <h2 className="px-6 py-4 border-b border-slate-200 text-lg font-semibold text-slate-900">
            MOT history
          </h2>
          {motTests.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {motTests.map((test, i) => (
                <li key={test.motTestNumber ?? i} className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        test.testResult === "PASSED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {test.testResult ?? "—"}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {formatDate(test.completedDate)}
                    </span>
                    {test.odometerValue && (
                      <span className="text-slate-500 text-sm">
                        {Number(test.odometerValue).toLocaleString()} {test.odometerUnit ?? "mi"}
                      </span>
                    )}
                  </div>
                  {test.expiryDate && test.testResult === "PASSED" && (
                    <p className="text-slate-500 text-sm mb-2">
                      Expires {formatDate(test.expiryDate)}
                    </p>
                  )}
                  {((test.rfrAndComments ?? test.defects) ?? []).length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {(test.rfrAndComments ?? test.defects ?? []).map((rfr, j) => (
                        <li
                          key={j}
                          className={`text-sm ${
                            rfr.type === "FAIL" || rfr.type === "DANGEROUS"
                              ? "text-red-700"
                              : rfr.type === "ADVISORY"
                                ? "text-amber-700"
                                : rfr.type === "MINOR"
                                  ? "text-amber-600"
                                  : "text-slate-600"
                          }`}
                        >
                          <span className="font-medium uppercase text-slate-500 mr-2">
                            {rfr.type}
                          </span>
                          {rfr.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-slate-500">
              MOT info failed to retrieve.
            </p>
          )}
        </section>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Data from DVLA Vehicle Enquiry Service and MOT History API.</p>
        </footer>
      </div>
    </div>
  );
}
