import { createClient } from "@/lib/supabase/server";
import type { VehicleReport } from "@/lib/supabase/types";

export const metadata = {
  title: "My receipts | RevVeal",
};

function formatPlate(reg: string): string {
  return reg.replace(/\s+/g, "").toUpperCase();
}

function formatMoney(pence: number | null, currency: string | null): string {
  if (pence == null) return "—";
  const amount = (pence / 100).toFixed(2);
  const symbol = (currency ?? "gbp").toLowerCase() === "gbp" ? "£" : "";
  return `${symbol}${amount}`;
}

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("vehicle_reports")
    .select("id, registration, purchased_at, amount_pence, currency, status, stripe_checkout_session_id")
    .eq("user_id", user!.id)
    .order("purchased_at", { ascending: false });

  const rows = (reports ?? []) as Pick<
    VehicleReport,
    | "id"
    | "registration"
    | "purchased_at"
    | "amount_pence"
    | "currency"
    | "status"
    | "stripe_checkout_session_id"
  >[];

  return (
    <section>
      <h2 className="font-display text-2xl">My receipts</h2>
      <p className="mt-2 text-sm text-muted">Payment history for your full vehicle reports.</p>

      {rows.length === 0 ? (
        <div className="mt-8 border-y border-hairline py-12 text-center">
          <p className="text-muted text-sm">No receipts yet.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
          {rows.map((row) => (
            <li key={row.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    Full report — {formatPlate(row.registration)}
                  </p>
                  <p className="kicker text-muted mt-1">
                    {new Date(row.purchased_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="font-display text-lg text-foreground tabular-nums">
                  {formatMoney(row.amount_pence, row.currency)}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted capitalize">Status: {row.status}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
