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
    <div className="min-h-screen bg-gradient-to-b from-background via-background-elevated to-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Hi, {firstName}</h1>
        <p className="mt-2 text-muted">Your RevVeal account dashboard.</p>

        <div className="mt-8 rounded-3xl bg-card border border-card-border p-6 sm:p-8 shadow-lg shadow-black/30">
          <DashboardNav />
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-8">
          <Link href="/" className="text-amber-400 font-medium hover:underline text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
