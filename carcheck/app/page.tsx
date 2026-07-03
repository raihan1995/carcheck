"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { RevVealLogo } from "./components/RevVealLogo";

function normalizeRegistration(vrn: string): string {
  return vrn.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export default function Home() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [recentRegs, setRecentRegs] = useState<string[]>([]);
  const RECENT_KEY = "revveal_recent_regs";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(RECENT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((v) => (typeof v === "string" ? normalizeRegistration(v) : ""))
          .filter(Boolean);
        setRecentRegs(cleaned.slice(0, 5));
      }
    } catch {
      // Ignore malformed localStorage
    }
  }, []);

  function updateRecentRegs(reg: string) {
    const normalized = normalizeRegistration(reg);
    if (!normalized) return;
    setRecentRegs((prev) => {
      const next = [normalized, ...prev.filter((r) => r !== normalized)].slice(0, 5);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          // Ignore quota / privacy errors
        }
      }
      return next;
    });
  }

  function handleRecentClick(reg: string) {
    const normalized = normalizeRegistration(reg);
    if (!normalized) return;
    setPlate(normalized);
    router.push(`/vehicle/${encodeURIComponent(normalized)}`);
  }

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
          updateRecentRegs(reg);
          router.push(`/vehicle/${encodeURIComponent(reg)}`);
          return;
        }
        setError(data.error || "Check failed");
        return;
      }
      const reg = data.vehicle?.registrationNumber ?? normalizeRegistration(vrn);
      updateRecentRegs(reg);
      router.push(`/vehicle/${encodeURIComponent(reg)}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background">
      {/* Hero banner — logo image as the visual anchor (Auto Trader–style hero) */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-background-elevated border border-hairline shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/revveal.png"
            alt=""
            aria-hidden
            className="w-full h-auto max-h-[220px] sm:max-h-[280px] object-cover object-center"
          />
        </div>

        {/* Floating search card overlapping the banner */}
        <div className="relative z-10 -mt-8 sm:-mt-10 mx-auto max-w-3xl">
          <div className="rounded-2xl border border-hairline bg-card px-5 py-6 sm:px-8 sm:py-8 shadow-lg shadow-black/5">
            <div className="flex justify-center mb-6">
              <RevVealLogo variant="full" />
            </div>

            <p className="text-center text-muted text-sm sm:text-base max-w-md mx-auto">
              Enter a UK number plate to view vehicle details, MOT history, tax and ULEZ status.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <label htmlFor="plate" className="sr-only">
                Registration number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface border border-hairline px-3 sm:px-4 min-h-[52px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                  <span
                    className="hidden sm:flex shrink-0 select-none flex-col items-center justify-center rounded-[3px] bg-[#003399] px-1.5 py-1 text-[#ffd132]"
                    aria-hidden
                  >
                    <span className="text-[8px] leading-none">★</span>
                    <span className="font-mono text-[10px] font-bold leading-tight">UK</span>
                  </span>
                  <input
                    id="plate"
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12 CDE"
                    className="flex-1 min-w-0 bg-transparent py-3 font-mono text-lg sm:text-xl tracking-[0.12em] text-foreground placeholder-muted/50 focus:outline-none"
                    disabled={loading}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto sm:shrink-0 min-h-[52px] px-8 rounded-xl bg-accent text-white font-semibold hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 transition-colors touch-manipulation"
                >
                  {loading ? "Checking…" : "Check vehicle"}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 font-medium text-center" role="alert">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Content below hero */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        {recentRegs.length > 0 && (
          <section className="max-w-3xl mx-auto mb-12">
            <p className="kicker text-muted text-center">Recent checks</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {recentRegs.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => handleRecentClick(reg)}
                  className="inline-flex items-center rounded-lg border border-hairline bg-card px-3 py-1.5 font-mono text-sm tracking-[0.12em] text-muted-strong hover:border-accent/60 hover:text-accent transition-colors shadow-sm"
                >
                  {reg}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-hairline pt-10">
          <p className="kicker text-muted text-center">Inside every check</p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              ["01", "Vehicle details", "Make, colour, fuel, year, engine"],
              ["02", "MOT history", "Every test, advisory and mileage reading"],
              ["03", "Tax & ULEZ", "Status, due dates and clean-air compliance"],
              ["04", "Mileage insight", "Yearly averages and anomaly detection"],
            ].map(([num, title, desc]) => (
              <div key={num} className="rounded-xl border border-hairline bg-card p-5 shadow-sm">
                <span className="section-index text-sm text-accent">{num}</span>
                <dt className="font-display mt-2 text-lg leading-tight">{title}</dt>
                <dd className="mt-1 text-sm text-muted">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-14 border-t border-hairline pt-6 text-center text-xs text-muted">
          <p>Data from the DVLA Vehicle Enquiry Service and the MOT History API. For information only.</p>
        </footer>
      </div>
    </div>
  );
}
