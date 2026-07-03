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
    <div className="bg-white text-foreground">
      {/* Editorial hero — asymmetric grid, hairlines, oversized plate input */}
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-20">
        <div
          className="contour pointer-events-none absolute -right-32 top-8 hidden h-[480px] w-[480px] lg:block"
          style={{ ["--r" as string]: "240px" }}
          aria-hidden
        />

        <div className="relative max-w-xl">
          <p className="kicker text-accent">01 — UK Number Plate Check</p>

          <h1 className="font-display mt-6 text-5xl sm:text-6xl lg:text-[4rem] font-medium leading-[1.12] text-foreground">
            <span className="text-foreground">Re</span>
            <span className="text-accent">veal</span> a car&apos;s
            <br />
            <span className="italic text-foreground">whole</span> story.
          </h1>

          <p className="mt-6 max-w-md text-base sm:text-lg leading-relaxed text-muted-strong">
            One number plate. Make, MOT history, mileage, tax, ULEZ and emissions —
            drawn straight from the DVLA and the MOT register.
          </p>

          <form onSubmit={handleSubmit} className="mt-10">
            <label htmlFor="plate" className="block text-sm font-medium text-muted-strong">
              Registration
            </label>
            <div className="mt-3 flex items-stretch border-b-2 border-foreground/20 focus-within:border-accent transition-colors">
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
                className="flex-1 min-w-0 bg-transparent pb-3 font-mono text-2xl sm:text-3xl tracking-[0.08em] text-foreground placeholder-muted/50 focus:outline-none"
                disabled={loading}
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="group mb-2 ml-3 inline-flex shrink-0 items-center gap-2 self-end rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50 touch-manipulation transition-colors"
              >
                {loading ? "Checking…" : "Reveal"}
                {!loading && (
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600 font-medium" role="alert">
                {error}
              </p>
            )}
          </form>

          {recentRegs.length > 0 && (
            <section className="mt-10 pt-8 border-t border-hairline">
              <p className="kicker text-muted">Recent checks</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentRegs.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => handleRecentClick(reg)}
                    className="inline-flex items-center border border-hairline bg-white px-3 py-1.5 font-mono text-xs sm:text-sm tracking-[0.15em] text-muted-strong hover:border-accent hover:text-accent transition-colors"
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="relative lg:pt-4">
          <div className="border-t border-hairline pt-6 lg:border-t-0 lg:pt-0 lg:border-l lg:border-hairline lg:pl-10">
            <p className="kicker text-muted">Inside every check</p>
            <dl className="mt-5 divide-y divide-hairline">
              {[
                ["01", "Vehicle details", "Make, colour, fuel, year, engine"],
                ["02", "MOT history", "Every test, advisory and mileage reading"],
                ["03", "Tax & ULEZ", "Status, due dates and clean-air compliance"],
                ["04", "Mileage insight", "Yearly averages and anomaly detection"],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex gap-4 py-5">
                  <span className="section-index pt-0.5 text-sm text-accent">{num}</span>
                  <div>
                    <dt className="text-lg font-semibold leading-snug text-foreground">{title}</dt>
                    <dd className="mt-1.5 text-sm text-muted leading-relaxed">{desc}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <footer className="border-t border-hairline bg-white">
        <p className="mx-auto max-w-6xl px-5 sm:px-8 py-8 text-xs text-muted">
          Data from the DVLA Vehicle Enquiry Service and the MOT History API. For information only.
        </p>
      </footer>
    </div>
  );
}
