import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Car Check | Number Plate Lookup",
  description: "Check UK vehicle details by number plate. Get make, colour, MOT and tax status from the DVLA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
