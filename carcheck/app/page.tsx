"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function normalizeRegistration(vrn: string): string {
  return vrn.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export default function Home() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const vrn = plate.trim();
    if (!vrn) {
      setError("Enter a registration number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: vrn }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.demo && data.vehicle) {
          const reg = normalizeRegistration(vrn);
          router.push(`/vehicle/${encodeURIComponent(reg)}`);
          return;
        }
        setError(data.error || "Check failed");
        return;
      }
      const reg = data.vehicle?.registrationNumber ?? normalizeRegistration(vrn);
      router.push(`/vehicle/${encodeURIComponent(reg)}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>
            Data from the DVLA Vehicle Enquiry Service and MOT History API. For official use only.
          </p>
        </footer>
      </div>
    </div>
  );
}
