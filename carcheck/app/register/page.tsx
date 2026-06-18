import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/app/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/server";

import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Register | RevVeal",
  description: "Create a free RevVeal account.",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard/reports");
  }

  return (
    <Suspense
      fallback={
        <AuthShell title="Create account" subtitle="Sign up for a free RevVeal account.">
          <p className="text-muted text-sm">Loading…</p>
        </AuthShell>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
