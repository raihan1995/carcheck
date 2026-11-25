import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrationPlate } from "@/app/components/RegistrationPlate";
import { ReloadButton } from "@/app/components/ReloadButton";
import { Icon } from "@/app/components/ui/Icon";
import { formatDate } from "@/lib/vehicle-summary";
export const metadata = { title: "Payment history" };
export default async function ReceiptsPage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/receipts");
  const { data: reports, error } = await client
    .from("vehicle_reports")
    .select("id,registration,purchased_at,amount_pence,currency,status")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h1>Payment history</h1>
          <p>Payments recorded against your account reports.</p>
        </div>
        <Link href="/dashboard/reports" className="button button-secondary">
          Your reports
        </Link>
      </div>
      {error ? (
        <div className="card empty-state">
          <Icon name="info" size={28} />
          <h2>Payments could not be loaded</h2>
          <p role="alert">
            Please try again. We could not retrieve your report payments.
          </p>
          <ReloadButton />
        </div>
      ) : reports?.length ? (
        <ul className="vehicle-list">
          {reports.map((report) => (
            <li key={report.id} className="card card-body">
              <div
                className="button-row"
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <RegistrationPlate
                    registration={report.registration}
                    compact
                  />
                  <p className="small muted" style={{ margin: "12px 0 0" }}>
                    {formatDate(report.purchased_at)} · {report.status}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>
                    {report.amount_pence == null
                      ? "Amount not supplied"
                      : new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          currency: report.currency || "GBP",
                        }).format(report.amount_pence / 100)}
                  </strong>
                  <p className="small muted" style={{ margin: 0 }}>
                    Amount paid · VAT breakdown not supplied
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card empty-state">
          <Icon name="file" size={28} />
          <h2>No payments recorded</h2>
          <p>
            Checkout is not available yet. No payment is needed for a free
            check.
          </p>
          <Link className="button button-secondary" href="/">
            Check a vehicle
          </Link>
        </div>
      )}
    </>
  );
}
