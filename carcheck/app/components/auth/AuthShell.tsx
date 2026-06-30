import Link from "next/link";
import type { ReactNode } from "react";

import { RevVealLogo } from "../RevVealLogo";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Editorial brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-hairline px-12 py-16 lg:flex lg:flex-col lg:justify-between">
        <div
          className="contour pointer-events-none absolute -left-32 bottom-0 h-[560px] w-[560px] opacity-60"
          style={{ ["--r" as string]: "280px", ["--cx" as string]: "0%", ["--cy" as string]: "100%" }}
          aria-hidden
        />
        <Link href="/" className="relative inline-flex">
          <RevVealLogo variant="compact" />
        </Link>
        <div className="relative max-w-sm">
          <p className="kicker text-accent">Members</p>
          <p className="font-display mt-5 text-4xl leading-tight tracking-tight">
            Every check you run, <span className="italic text-accent">kept</span> for keeps.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A free account saves your reports and receipts, and unlocks performance data on
            every vehicle you look up.
          </p>
        </div>
        <p className="relative kicker text-muted/60">RevVeal — UK Vehicle Records</p>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="kicker text-accent">Account</p>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
          <div className="mt-10">{children}</div>
          <p className="mt-10 border-t border-hairline pt-6">
            <Link href="/" className="link-underline text-sm text-muted hover:text-accent">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
