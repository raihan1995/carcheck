import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "./components/SiteHeader";
import { UmamiAnalytics } from "./components/UmamiAnalytics";
import "./globals.css";

/* UI 4.0 "Garage Atelier" type system:
   Fraunces  — high-contrast serif for editorial display / headings
   Space Grotesk — warm grotesk for body and UI
   JetBrains Mono — technical figures, plates, dates */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
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
      className={`overflow-x-hidden bg-background ${fraunces.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased overflow-x-hidden min-h-screen flex flex-col bg-background text-foreground">
        <div className="grain-overlay" aria-hidden />
        <SiteHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
