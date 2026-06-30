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
    return `link-underline py-1 text-sm transition-colors ${
      isNavActive(href)
        ? "text-accent"
        : "text-muted hover:text-foreground"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 sm:h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          title="Home"
          className="flex items-center shrink-0 text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm min-h-[44px]"
        >
          <RevVealLogo variant="compact" />
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)}>
              {label}
            </Link>
          ))}
          <span className="h-5 w-px bg-hairline" aria-hidden />
          {user ? (
            <>
              <Link
                href="/dashboard/reports"
                className={`link-underline py-1 text-sm transition-colors ${
                  isDashboardPath(pathname) ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                <span className="hidden lg:inline">Hi, {user.firstName}</span>
                <span className="lg:hidden">Account</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="link-underline py-1 text-sm text-muted hover:text-foreground transition-colors disabled:opacity-60"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass("/login")}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-accent/50 px-5 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-background transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 md:hidden items-center justify-center rounded-sm text-muted hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
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
            className="fixed inset-0 top-16 sm:top-[4.5rem] z-40 bg-background/80 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-y border-hairline bg-background md:hidden">
            <nav className="flex flex-col px-5 py-3">
              {navLinks.map(({ href, label }, i) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-baseline gap-3 py-3.5 text-lg font-display ${
                    isNavActive(href) ? "text-accent" : "text-foreground/90"
                  }`}
                >
                  <span className="section-index text-xs text-muted/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard/reports"
                    onClick={() => setMenuOpen(false)}
                    className={`py-3.5 text-lg font-display border-t border-hairline mt-1 ${
                      isDashboardPath(pathname) ? "text-accent" : "text-foreground/90"
                    }`}
                  >
                    {user.firstName} {user.surname} — Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="py-3.5 text-lg font-display text-left text-muted disabled:opacity-60"
                  >
                    {loggingOut ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-3 border-t border-hairline pt-4">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-lg font-display text-foreground/90"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-accent/50 px-5 py-3 text-center text-base font-medium text-accent"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
