import Link from "next/link";
import { DashboardNav } from "@/app/dashboard/DashboardNav";
import { DashboardHome } from "@/app/components/dashboard/DashboardHome";
export const metadata = {
  title: "Dashboard design preview",
  robots: { index: false, follow: false },
};
export default function DashboardPreview() {
  return (
    <div className="dashboard-shell">
      <div className="container">
        <div className="notice" style={{ marginBottom: 24 }}>
          <p>
            Dashboard layout preview. This does not sign you in or show account
            reports. Local cars and dates belong to this browser.{" "}
            <Link href="/login">Sign in to your account</Link>.
          </p>
        </div>
        <div className="dashboard-grid">
          <DashboardNav />
          <div className="dashboard-content">
            <DashboardHome firstName="there" reportCount={0} />
          </div>
        </div>
      </div>
    </div>
  );
}
