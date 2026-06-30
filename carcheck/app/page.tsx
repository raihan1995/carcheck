"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* signature contour arc, anchored top-right behind the hero */}
      <div
        className="contour pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] opacity-70"
        style={{ ["--r" as string]: "320px", ["--cx" as string]: "100%", ["--cy" as string]: "0%" }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pt-12 pb-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-28">
        {/* Left column — editorial hero + search */}
        <div className="max-w-xl">
          <p className="kicker text-accent">01 — UK Number Plate Check</p>

          <h1 className="font-display mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight">
            Reveal a car&apos;s
            <br />
            <span className="italic text-accent">whole</span> story.
          </h1>

          <p className="mt-6 max-w-md text-base sm:text-lg leading-relaxed text-muted">
            One number plate. Make, MOT history, mileage, tax, ULEZ and emissions —
            drawn straight from the DVLA and the MOT register.
          </p>

          <form onSubmit={handleSubmit} className="mt-10">
            <label htmlFor="plate" className="kicker block text-muted">
              Registration
            </label>
            <div className="mt-3 flex items-stretch border-b-2 border-foreground/30 focus-within:border-accent transition-colors">
              {/* GB plate band — a small, recognisably-human detail */}
              <span
                className="mb-2 mr-3 hidden select-none flex-col items-center justify-center rounded-[3px] bg-[#003399] px-2 py-1 text-[#ffd132] sm:flex"
                aria-hidden
              >
                <span className="text-[9px] leading-none">★</span>
                <span className="font-mono text-xs font-bold leading-tight">UK</span>
              </span>
              <input
                id="plate"
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="AB12 CDE"
                className="flex-1 min-w-0 bg-transparent pb-3 font-mono text-3xl sm:text-4xl tracking-[0.15em] text-foreground placeholder-muted/30 focus:outline-none"
                disabled={loading}
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="group mb-2 ml-3 inline-flex shrink-0 items-center gap-2 self-end pb-1 text-sm font-medium text-accent disabled:opacity-50 touch-manipulation"
              >
                {loading ? "Checking…" : "Reveal"}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-400 font-medium" role="alert">
                {error}
              </p>
            )}
          </form>

          {recentRegs.length > 0 && (
            <section className="mt-10">
              <p className="kicker text-muted">Recent checks</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {recentRegs.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => handleRecentClick(reg)}
                    className="inline-flex items-center rounded-sm border border-hairline px-3 py-1.5 font-mono text-xs sm:text-sm tracking-[0.15em] text-muted-strong hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column — editorial index / what you get */}
        <aside className="lg:pt-16">
          <div className="border-t border-hairline pt-6">
            <p className="kicker text-muted">Inside every check</p>
            <dl className="mt-5 divide-y divide-hairline">
              {[
                ["01", "Vehicle details", "Make, colour, fuel, year, engine"],
                ["02", "MOT history", "Every test, advisory and mileage reading"],
                ["03", "Tax & ULEZ", "Status, due dates and clean-air compliance"],
                ["04", "Mileage insight", "Yearly averages and anomaly detection"],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex gap-4 py-4">
                  <span className="section-index pt-0.5 text-sm text-accent/70">{num}</span>
                  <div>
                    <dt className="font-display text-lg leading-tight">{title}</dt>
                    <dd className="mt-0.5 text-sm text-muted">{desc}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <footer className="relative mx-auto max-w-6xl px-5 pb-12 sm:px-8">
        <p className="border-t border-hairline pt-6 text-xs text-muted/70">
          Data from the DVLA Vehicle Enquiry Service and the MOT History API. For information only.
        </p>
      </footer>
    </div>
  );
}
