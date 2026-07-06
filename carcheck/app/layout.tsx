import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { SiteHeader } from "./components/SiteHeader";
import { UmamiAnalytics } from "./components/UmamiAnalytics";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RevVeal | UK Car Check & Number Plate Lookup",
  description: "Check UK vehicle details by number plate. Get make, colour, MOT and tax status from the DVLA.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`overflow-x-hidden bg-white text-foreground ${montserrat.variable}`}
      style={{ colorScheme: "light" }}
    >
      <body className="antialiased overflow-x-hidden min-h-screen flex flex-col bg-white text-foreground font-sans">
        <div className="grain-overlay" aria-hidden />
        <SiteHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
