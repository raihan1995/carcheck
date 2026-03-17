import Link from "next/link";

export const metadata = {
  title: "Contact us | RevVeal",
  description: "Get in touch with RevVeal.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Contact us</h1>
        <p className="mt-4 text-slate-600">
          Get in touch with the RevVeal team. We&apos;ll add contact details here.
        </p>
        <div className="mt-8 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-lg shadow-slate-200/30">
          <p className="text-slate-500 text-sm">
            Contact form or email address can be added to this page.
          </p>
        </div>
        <p className="mt-8">
          <Link href="/" className="text-amber-600 font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
