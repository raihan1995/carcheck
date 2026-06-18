import { redirect } from "next/navigation";

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

  return <RegisterForm />;
}
