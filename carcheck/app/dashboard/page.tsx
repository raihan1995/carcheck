import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHome } from "@/app/components/dashboard/DashboardHome";
export default async function DashboardPage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { count, error }] = await Promise.all([
    client
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle(),
    client
      .from("vehicle_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  return (
    <DashboardHome
      firstName={
        profile?.first_name || user.user_metadata?.first_name || "there"
      }
      reportCount={error ? null : count || 0}
    />
  );
}
