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
      <h2 className="font-display text-2xl">My reports</h2>
      <p className="mt-2 text-sm text-muted">
        Full vehicle reports you&apos;ve purchased — saved on your account permanently.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 border-y border-hairline py-12 text-center">
          <p className="text-muted text-sm">No purchased reports yet.</p>
          <Link
            href="/"
            className="link-underline mt-3 inline-flex text-sm font-medium text-accent"
          >
            Check a vehicle
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
          {rows.map((report) => (
            <li
              key={report.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5"
            >
              <div>
                <p className="font-mono text-lg font-bold tracking-[0.12em] text-foreground">
                  {formatPlate(report.registration)}
                </p>
                <p className="kicker text-muted mt-1">
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
                className="link-underline inline-flex items-center gap-2 self-start text-sm font-medium text-accent sm:self-auto"
              >
                View report
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
