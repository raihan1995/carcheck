import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/reports");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, surname")
    .eq("id", user.id)
    .maybeSingle();

  const firstName =
    (profile as Pick<Profile, "first_name"> | null)?.first_name ||
    (user.user_metadata?.first_name as string | undefined) ||
    "there";

  return (
    <div className="relative">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-12 sm:py-16">
        <p className="kicker text-accent">Dashboard</p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
          Hi, {firstName}
        </h1>
        <p className="mt-3 text-muted">Your reports, receipts and account settings.</p>

        <div className="mt-10">
          <DashboardNav />
          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-12 border-t border-hairline pt-6">
          <Link href="/" className="link-underline text-muted hover:text-accent text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
