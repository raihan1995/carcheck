import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: guides.find((g) => g.slug === slug)?.title || "Guide not found",
  };
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();
  return (
    <article className="container section">
      <div className="breadcrumbs">
        <Link href="/guides">Guides</Link>
        <span>/</span>
        <span>{guide.category}</span>
      </div>
      <div className="article-layout">
        <nav className="article-nav" aria-label="In this guide">
          <span className="eyebrow">In this guide</span>
          {guide.sections.map((section, i) => (
            <a key={section.title} href={`#section-${i}`}>
              {section.title}
            </a>
          ))}
          <Link href="/">Check a vehicle</Link>
        </nav>
        <div>
          <span className="eyebrow">{guide.category}</span>
          <h1 style={{ fontSize: "var(--text-40)" }}>{guide.title}</h1>
          <p className="lead">{guide.description}</p>
          <div className="prose" style={{ marginTop: 48 }}>
            {guide.sections.map((section, i) => (
              <section id={`section-${i}`} key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 48 }}>
            Further reading:{" "}
            <a
              href={guide.source}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              {guide.sourceLabel}
            </a>
            .
          </p>
          <Link
            href="/"
            className="button button-primary"
            style={{ marginTop: 16 }}
          >
            Start a free check
          </Link>
        </div>
      </div>
    </article>
  );
}
