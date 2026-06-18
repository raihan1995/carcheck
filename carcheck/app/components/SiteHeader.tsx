"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { RevVealLogo } from "./RevVealLogo";

type HeaderUser = {
  firstName: string;
  surname: string;
};

const SAMPLE_REPORT_PATH = "/vehicle/SAMPLE";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact us" },
  { href: SAMPLE_REPORT_PATH, label: "Sample" },
];

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, surname")
        .eq("id", authUser.id)
        .maybeSingle();

      setUser({
        firstName:
          profile?.first_name ??
          (authUser.user_metadata?.first_name as string | undefined) ??
          "Account",
        surname:
          profile?.surname ?? (authUser.user_metadata?.surname as string | undefined) ?? "",
      });
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession, pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isNavActive(href: string): boolean {
    if (href === SAMPLE_REPORT_PATH) {
      return pathname === SAMPLE_REPORT_PATH || pathname === "/vehicle/sample";
    }
    return pathname === href;
  }

  function navLinkClass(href: string) {
    return `rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isNavActive(href)
        ? "bg-amber-500/15 text-amber-400"
        : "text-muted hover:bg-surface hover:text-foreground"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-card/95 backdrop-blur-sm shadow-sm shadow-black/20">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          title="Home"
          className="flex items-center shrink-0 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-background rounded-lg min-h-[44px] items-center"
        >
          <RevVealLogo variant="compact" className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)}>
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard/reports"
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hidden lg:inline ${
                  isDashboardPath(pathname)
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-muted hover:bg-surface hover:text-amber-400"
                }`}
              >
                Hi, {user.firstName}
              </Link>
              <Link
                href="/dashboard/reports"
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:hidden ${
                  isDashboardPath(pathname)
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-foreground transition-colors disabled:opacity-60"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass("/login")}>
                Login
              </Link>
              <Link href="/register" className={navLinkClass("/register")}>
                Register
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 md:hidden items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-background"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 sm:top-16 z-40 bg-black/60 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-card-border bg-card shadow-lg shadow-black/40 md:hidden">
            <nav className="flex flex-col py-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3.5 text-base font-medium ${
                    isNavActive(href)
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-foreground/90 hover:bg-surface"
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard/reports"
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3.5 text-base font-medium border-t border-card-border mt-1 ${
                      isDashboardPath(pathname)
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-foreground/90 hover:bg-surface"
                    }`}
                  >
                    {user.firstName} {user.surname} — Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="px-4 py-3.5 text-base font-medium text-left text-foreground/90 hover:bg-surface disabled:opacity-60"
                  >
                    {loggingOut ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3.5 text-base font-medium ${
                      pathname === "/login"
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-foreground/90 hover:bg-surface"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3.5 text-base font-medium ${
                      pathname === "/register"
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-foreground/90 hover:bg-surface"
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
