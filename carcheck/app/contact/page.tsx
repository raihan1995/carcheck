import Link from "next/link";

import { EmailWithCopy } from "./EmailWithCopy";

export const metadata = {
  title: "Contact us | RevVeal",
  description: "Get in touch with RevVeal.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background-elevated to-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contact us</h1>
        <p className="mt-4 text-muted">
          Get in touch with the RevVeal team — we&apos;re happy to help.
        </p>
        <div className="mt-8 rounded-2xl bg-card border border-card-border p-6 shadow-lg shadow-black/30">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">Email</p>
          <EmailWithCopy />
        </div>
        <p className="mt-8">
          <Link href="/" className="text-amber-400 font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
