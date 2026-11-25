"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";
import { RegistrationSearch } from "./RegistrationSearch";
const columns = [
  {
    title: "Vehicle checks",
    links: [
      ["Free vehicle check", "/"],
      ["Sample report", "/vehicle/SAMPLE"],
      ["Full report contents", "/pricing"],
      ["Free vs full report", "/comparison"],
    ],
  },
  {
    title: "Useful information",
    links: [
      ["Buying guides", "/guides"],
      ["Questions & answers", "/faq"],
      ["MOT history explained", "/guides/reading-an-mot-history"],
      ["Mileage records explained", "/guides/checking-mileage"],
    ],
  },
  {
    title: "Your account",
    links: [
      ["Sign in", "/login"],
      ["Create an account", "/register"],
      ["Saved cars", "/dashboard/cars"],
      ["Your reports", "/dashboard/reports"],
    ],
  },
  {
    title: "RevVeal",
    links: [
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms & conditions", "/terms"],
      ["Data & security", "/security"],
    ],
  },
];
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname === "/preview/dashboard")
    return (
      <footer className="dashboard-footer">
        <p>
          © {new Date().getFullYear()} RevVeal. Independent UK vehicle checks.
        </p>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
      </footer>
    );
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href="/" className="brand-link" aria-label="RevVeal home">
              <Brand light />
            </Link>
            <p>RevVeal your car&apos;s history.</p>
          </div>
          <RegistrationSearch
            compact
            label="Start with a registration"
            button="Search"
          />
        </div>
        <div className="footer-links">
          {columns.map((column) => (
            <section key={column.title}>
              <h2>{column.title}</h2>
              {column.links.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </section>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RevVeal. All rights reserved.</p>
          <p>
            RevVeal is an independent service, not affiliated with the DVLA or
            DVSA. Vehicle data is supplied by third-party sources.
          </p>
          <p>
            Company details: [PLACEHOLDER] · Registered address: [PLACEHOLDER] ·
            VAT registration: [PLACEHOLDER]
          </p>
        </div>
      </div>
    </footer>
  );
}
