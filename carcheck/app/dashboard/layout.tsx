import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "./DashboardNav";

export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  return (
    <div className="dashboard-shell">
      <div className="container dashboard-grid">
        <DashboardNav />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
