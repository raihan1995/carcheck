import Link from "next/link";

import { EmailWithCopy } from "./EmailWithCopy";

export const metadata = {
  title: "Contact us | RevVeal",
  description: "Get in touch with RevVeal.",
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="contour pointer-events-none absolute -right-40 -top-32 h-[560px] w-[560px] opacity-60"
        style={{ ["--r" as string]: "280px", ["--cx" as string]: "100%", ["--cy" as string]: "0%" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
        <p className="kicker text-accent">Get in touch</p>
        <h1 className="font-display mt-5 text-5xl sm:text-6xl font-semibold tracking-tight">
          Talk to us.
        </h1>
        <p className="mt-5 max-w-md text-muted leading-relaxed">
          Questions, data corrections, or anything else — the RevVeal team is happy to help.
        </p>

        <div className="mt-12 border-t border-hairline pt-8">
          <p className="kicker text-muted">Email</p>
          <EmailWithCopy />
        </div>

        <p className="mt-12 border-t border-hairline pt-6">
          <Link href="/" className="link-underline text-muted hover:text-accent text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
