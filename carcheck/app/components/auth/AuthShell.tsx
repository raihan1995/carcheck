import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background-elevated to-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-muted text-sm sm:text-base">{subtitle}</p>}
        <div className="mt-8 rounded-3xl bg-card/80 backdrop-blur-sm border border-card-border p-6 sm:p-8 shadow-xl shadow-black/40 ring-1 ring-white/5">
          {children}
        </div>
        <p className="mt-8 text-center">
          <Link href="/" className="text-amber-400 font-medium hover:underline text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
