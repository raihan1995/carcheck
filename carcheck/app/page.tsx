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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16 sm:px-6">
        <header className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25 mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0-6.75h.008v.008H8.25V6.75Zm0 2.25h.008v.008H8.25V9Zm6-3h.008v.008H14.25V6.75Zm0 2.25h.008v.008H14.25V9Zm0 2.25h.008v.008H14.25v-.008Zm0 2.25h.008v.008H14.25V15Z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            UK Car Check
          </h1>
          <p className="mt-3 text-slate-500 text-base sm:text-lg max-w-sm mx-auto">
            Enter a UK number plate to view vehicle details, MOT history and ULEZ status
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="relative rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/80 p-5 sm:p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5"
        >
          <label htmlFor="plate" className="block text-sm font-semibold text-slate-600 mb-3">
            Registration number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="plate"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="e.g. AB12 CDE"
              className="flex-1 min-h-[52px] rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 px-4 py-3.5 text-base sm:text-lg font-mono tracking-widest sm:tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 focus:bg-white transition-all"
              disabled={loading}
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto sm:shrink-0 min-h-[52px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
        </form>

        <footer className="mt-14 pb-8 sm:pb-0 text-center text-slate-400 text-sm px-2">
          <p>
            Data from the DVLA Vehicle Enquiry Service and MOT History API. For official use only.
          </p>
        </footer>
      </div>
    </div>
  );
}
