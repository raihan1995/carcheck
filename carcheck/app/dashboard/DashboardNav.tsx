"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/reports", label: "My reports" },
  { href: "/dashboard/receipts", label: "My receipts" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-8 border-b border-hairline">
      {tabs.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
