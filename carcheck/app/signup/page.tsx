import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth/session";

export default async function SignupRedirectPage() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/register");
}
