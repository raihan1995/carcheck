import Link from "next/link";
import { guides } from "@/lib/guides";
import { Icon } from "@/app/components/ui/Icon";
export const metadata = { title: "Vehicle guides" };
export default function GuidesPage() {
  return (
    <div className="container section">
      <span className="eyebrow">The reading room</span>
      <h1 style={{ fontSize: "var(--text-40)" }}>
        A better look
        <br />
        at the records.
      </h1>
      <p className="lead">
        Practical notes for the questions a vehicle check brings up.
      </p>
      <div className="guide-list" style={{ marginTop: 48 }}>
        {guides.map((guide) => (
          <Link
            className="guide-item"
            href={`/guides/${guide.slug}`}
            key={guide.slug}
          >
            <div className="guide-art">
              <Icon name={guide.icon} />
            </div>
            <div>
              <span className="eyebrow">{guide.category}</span>
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
            </div>
            <Icon name="chevron" />
          </Link>
        ))}
      </div>
    </div>
  );
}
