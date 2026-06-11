import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth/session";

import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Register | RevVeal",
  description: "Create a free RevVeal account.",
};

export default async function RegisterPage() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect("/dashboard");
  }

  return <RegisterForm />;
}
