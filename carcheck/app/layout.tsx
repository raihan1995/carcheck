import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UK Car Check | Number Plate Lookup",
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
    <html lang="en" className="overflow-x-hidden">
      <body className={`${plusJakarta.className} antialiased overflow-x-hidden min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
