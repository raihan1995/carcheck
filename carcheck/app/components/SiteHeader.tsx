"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "./Brand";
import { Icon } from "./ui/Icon";

const links = [
  { href: "/", label: "Vehicle check" },
  { href: "/vehicle/SAMPLE", label: "Sample report" },
  { href: "/pricing", label: "Pricing" },
  { href: "/guides", label: "Guides" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void Promise.resolve()
      .then(async () => {
        const client = createClient();
        const load = async () => {
          const {
            data: { user },
          } = await client.auth.getUser();
          if (active)
            setName(
              user ? user.user_metadata?.first_name || "My account" : null,
            );
        };
        await load();
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(() => {
          window.setTimeout(() => {
            if (active) void load();
          }, 0);
        });
        unsubscribe = () => subscription.unsubscribe();
        if (!active) unsubscribe();
      })
      .catch(() => {
        if (active) setName(null);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      setName(null);
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      setError("We could not sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <header
      className="site-header"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Link href="/" className="brand-link" aria-label="RevVeal home">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-account">
          {name ? (
            <>
              <Link href="/dashboard" className="button button-secondary">
                <Icon name="user" size={18} />
                {name}
              </Link>
              <button
                className="button button-ghost icon-button"
                aria-label="Sign out"
                onClick={logout}
                disabled={busy}
              >
                <Icon name="logout" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/register" className="button button-primary">
                Create account
              </Link>
            </>
          )}
        </div>
        <button
          className="button button-secondary icon-button mobile-toggle"
          ref={toggle}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="container mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ...links,
            {
              href: name ? "/dashboard" : "/login",
              label: name ? "My account" : "Sign in",
            },
            ...(!name ? [{ href: "/register", label: "Create account" }] : []),
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          {name && (
            <button
              className="button button-ghost"
              onClick={logout}
              disabled={busy}
            >
              Sign out
            </button>
          )}
        </nav>
      )}
      {error && (
        <p role="alert" className="container header-error small">
          {error}
        </p>
      )}
    </header>
  );
}
