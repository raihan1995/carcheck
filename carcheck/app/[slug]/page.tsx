import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/app/components/ui/Icon";
const pages: Record<
  string,
  { title: string; description: string; items: [string, string][] }
> = {
  privacy: {
    title: "Privacy",
    description: "How personal information is used and stored.",
    items: [
      [
        "Data controller",
        "[PLACEHOLDER] Legal entity, registered address and privacy contact.",
      ],
      [
        "Account information",
        "Authentication and account information use Supabase. Saved cars, recent checks and reminder dates in this version are kept in this browser’s local storage.",
      ],
      [
        "Retention and your rights",
        "[PLACEHOLDER] Confirm retention periods, lawful bases, processors, international transfers and the process for privacy requests before publication.",
      ],
    ],
  },
  terms: {
    title: "Terms & conditions",
    description: "The terms for using RevVeal’s vehicle information service.",
    items: [
      [
        "Service provider",
        "[PLACEHOLDER] Legal entity, company number, registered address and contact details.",
      ],
      [
        "Service availability",
        "The free check uses available DVLA and MOT information. The £5.99 incl. VAT full report is in preparation and payments are not being accepted.",
      ],
      [
        "Terms awaiting review",
        "[PLACEHOLDER] Final service terms, limitations, cancellation rights and dispute process require approval before paid reports are offered.",
      ],
    ],
  },
  security: {
    title: "Data & security",
    description:
      "Where the information comes from, and what the service can tell you.",
    items: [
      [
        "Vehicle data",
        "Free records use the DVLA Vehicle Enquiry Service and DVSA MOT History API. RevVeal is not affiliated with the DVLA or DVSA.",
      ],
      [
        "Account access",
        "Supabase manages sign-in. Purchased report retrieval checks account ownership on the server. Provider API credentials remain on the server.",
      ],
      [
        "Report an issue",
        "[PLACEHOLDER] Publish the security contact and disclosure process before public launch.",
      ],
    ],
  },
};
export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: pages[slug]?.title || "Not found",
    robots: { index: false, follow: true },
  };
}
export default async function InformationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return (
    <article className="container section">
      <div className="article-layout">
        <nav className="article-nav" aria-label="Information pages">
          <span className="eyebrow">Information</span>
          {Object.entries(pages).map(([key, p]) => (
            <Link
              href={`/${key}`}
              key={key}
              aria-current={slug === key ? "page" : undefined}
            >
              {p.title}
            </Link>
          ))}
          <Link href="/contact">Contact</Link>
        </nav>
        <div>
          <span className="eyebrow">RevVeal</span>
          <h1 style={{ fontSize: "var(--text-40)" }}>{page.title}</h1>
          <p className="lead">{page.description}</p>
          <div className="notice" style={{ marginBlock: 32 }}>
            <Icon name="info" />
            <p>
              Draft information. Sections marked [PLACEHOLDER] need confirmed
              business details and review before publication.
            </p>
          </div>
          <div className="prose">
            {page.items.map(([heading, body]) => (
              <section key={heading}>
                <h2>{heading}</h2>
                <p>{body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
