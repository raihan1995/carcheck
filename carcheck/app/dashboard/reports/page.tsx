import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrationPlate } from "@/app/components/RegistrationPlate";
import { ReloadButton } from "@/app/components/ReloadButton";
import { Icon } from "@/app/components/ui/Icon";
import { formatDate } from "@/lib/vehicle-summary";
export const metadata = { title: "Your reports" };
export default async function ReportsPage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/reports");
  const { data: reports, error } = await client
    .from("vehicle_reports")
    .select("id, registration, purchased_at, status")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h1>Your reports</h1>
          <p>Purchased reports associated with your account.</p>
        </div>
        <Link className="button button-secondary" href="/dashboard/receipts">
          Payment history
        </Link>
      </div>
      {error ? (
        <div className="card empty-state">
          <Icon name="info" size={28} />
          <h2>Reports could not be loaded</h2>
          <p role="alert">
            Please try again. Your account may need its report storage
            configured.
          </p>
          <ReloadButton />
        </div>
      ) : reports?.length ? (
        <ul className="vehicle-list">
          {reports.map((report) => (
            <li className="card vehicle-list-row" key={report.id}>
              <Link href={`/report/${report.id}`}>
                <RegistrationPlate registration={report.registration} compact />
                <span>
                  <strong>Full report</strong>
                  <small>
                    {formatDate(report.purchased_at)} · {report.status}
                  </small>
                </span>
              </Link>
              <Icon name="chevron" size={18} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card empty-state">
          <Icon name="file" size={28} />
          <h2>No purchased reports yet</h2>
          <p>
            Paid reports and checkout are in preparation. You can view the
            sample in the meantime.
          </p>
          <Link href="/report/SAMPLE" className="button button-secondary">
            View full report sample
          </Link>
        </div>
      )}
    </>
  );
}
