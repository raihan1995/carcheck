import Link from "next/link";
import { FaqList } from "@/app/components/FaqList";
export const metadata = { title: "Questions & answers" };
export default function FaqPage() {
  return (
    <div className="container section">
      <div className="faq-layout">
        <div>
          <span className="eyebrow">Useful answers</span>
          <h1 style={{ fontSize: "var(--text-40)" }}>
            A little clarity
            <br />
            before you check.
          </h1>
          <p className="muted">
            What is included, where the information comes from, and how to read
            it.
          </p>
          <Link href="/contact" className="text-link">
            Contact RevVeal
          </Link>
        </div>
        <FaqList />
      </div>
    </div>
  );
}
