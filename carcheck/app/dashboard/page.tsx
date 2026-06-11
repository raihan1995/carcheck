import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

export const metadata = {
  title: "Dashboard | RevVeal",
  description: "Your RevVeal account.",
};

function formatMemberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?next=/dashboard");
  }

  const user = await findUserById(session.userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background-elevated to-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Hi, {session.firstName}
        </h1>
        <p className="mt-2 text-muted">Your RevVeal account dashboard.</p>

        <div className="mt-8 rounded-3xl bg-card border border-card-border p-6 sm:p-8 shadow-lg shadow-black/30 space-y-6">
          <section>
            <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Account</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Name</dt>
                <dd className="text-foreground font-medium mt-0.5">
                  {session.firstName} {session.surname}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="text-foreground font-medium mt-0.5 break-all">{session.email}</dd>
              </div>
              {user?.created_at && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted">Member since</dt>
                  <dd className="text-foreground font-medium mt-0.5">
                    {formatMemberSince(user.created_at)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="pt-4 border-t border-card-border">
            <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Quick actions</h2>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 transition-all text-sm"
              >
                Check a vehicle
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl border border-card-border bg-surface text-foreground font-medium hover:bg-surface/80 transition-colors text-sm"
              >
                Contact support
              </Link>
            </div>
          </section>
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
