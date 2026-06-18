import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import type { VehicleReport } from "@/lib/supabase/types";

export const metadata = {
  title: "My reports | RevVeal",
};

function formatPlate(reg: string): string {
  return reg.replace(/\s+/g, "").toUpperCase();
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("vehicle_reports")
    .select("id, registration, purchased_at, status")
    .eq("user_id", user!.id)
    .order("purchased_at", { ascending: false });

  const rows = (reports ?? []) as Pick<VehicleReport, "id" | "registration" | "purchased_at" | "status">[];

  return (
    <section>
      <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">My reports</h2>
      <p className="mt-1 text-sm text-muted">
        Full vehicle reports you&apos;ve purchased — saved on your account permanently.
      </p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-card-border bg-surface/50 p-6 text-center">
          <p className="text-muted text-sm">No purchased reports yet.</p>
          <Link
            href="/"
            className="mt-3 inline-flex text-sm font-medium text-amber-400 hover:underline"
          >
            Check a vehicle
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-card-border/60 rounded-2xl border border-card-border overflow-hidden">
          {rows.map((report) => (
            <li
              key={report.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-surface/30"
            >
              <div>
                <p className="font-mono font-bold tracking-widest text-foreground">
                  {formatPlate(report.registration)}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Purchased{" "}
                  {new Date(report.purchased_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Link
                href={`/vehicle/${encodeURIComponent(formatPlate(report.registration))}`}
                className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                View report
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
