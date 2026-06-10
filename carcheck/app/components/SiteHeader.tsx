"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RevVealLogo } from "./RevVealLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
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
                    pathname === href
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-foreground/90 hover:bg-surface"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
