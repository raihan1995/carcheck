import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/app/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Login | RevVeal",
  description: "Sign in to your RevVeal account.",
};

export default async function LoginPage() {
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
        <AuthShell title="Login" subtitle="Sign in to your RevVeal account.">
          <p className="text-muted text-sm">Loading…</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
