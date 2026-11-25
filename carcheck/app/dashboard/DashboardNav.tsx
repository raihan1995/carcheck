"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Icon, type IconName } from "@/app/components/ui/Icon";
const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/cars", label: "My cars", icon: "car" },
  { href: "/dashboard/reports", label: "Reports", icon: "file" },
  { href: "/dashboard/reminders", label: "Reminders", icon: "bell" },
  { href: "/dashboard/activity", label: "Activity", icon: "clock" },
  { href: "/dashboard/logbook", label: "Logbook", icon: "book" },
  { href: "/dashboard/tax-alerts", label: "Tax alerts", icon: "shield" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];
export function DashboardNav() {
  const path = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const current = links.find((link) => path === link.href)?.label || "Home";
  const items = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={() => {
        if (menu.current) menu.current.open = false;
      }}
      aria-current={
        path === link.href ||
        (path === "/preview/dashboard" && link.href === "/dashboard")
          ? "page"
          : undefined
      }
    >
      <Icon name={link.icon} size={20} />
      {link.label}
    </Link>
  ));
  return (
    <>
      <nav
        className="dashboard-nav dashboard-nav-desktop"
        aria-label="Account navigation"
      >
        {items}
      </nav>
      <details className="dashboard-mobile-nav" ref={menu}>
        <summary>
          Account / {current}
          <Icon name="down" size={18} />
        </summary>
        <nav aria-label="Mobile account navigation">{items}</nav>
      </details>
    </>
  );
}
