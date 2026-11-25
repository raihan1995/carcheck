import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { UmamiAnalytics } from "./components/UmamiAnalytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});
export const metadata: Metadata = {
  title: { default: "RevVeal | Reveal your car's history", template: "%s | RevVeal" },
  description:
    "Check a UK registration for free MOT history, mileage records and tax status. See what is included in the planned £5.99 incl. VAT full report.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="site-main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <UmamiAnalytics />
      </body>
    </html>
  );
}
