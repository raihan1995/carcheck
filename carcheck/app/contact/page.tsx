import Link from "next/link";
import { EmailWithCopy } from "./EmailWithCopy";
import { Icon } from "@/app/components/ui/Icon";
export const metadata = { title: "Contact RevVeal" };
export default function ContactPage() {
  return (
    <div className="container section">
      <div className="article-layout">
        <div>
          <span className="eyebrow">Get in touch</span>
          <h1 style={{ fontSize: "var(--text-40)" }}>
            A question
            <br />
            about a check?
          </h1>
          <p className="muted">
            Tell us which part of the record you are looking at. Never include
            passwords or payment details.
          </p>
        </div>
        <div className="stack">
          <section className="card">
            <div className="card-heading">
              <h2>Contact RevVeal</h2>
              <Icon name="mail" />
            </div>
            <div className="card-body">
              <p className="small muted">Support email</p>
              <EmailWithCopy />
            </div>
          </section>
          <section className="card card-body">
            <h2 style={{ fontSize: "var(--text-20)" }}>
              A detail looks incorrect
            </h2>
            <p className="muted">
              Vehicle records are supplied by third parties. First compare the
              result with the official DVLA or MOT record.
            </p>
            <div className="button-row">
              <a
                href="https://www.gov.uk/check-vehicle-tax"
                className="text-link small"
                target="_blank"
                rel="noreferrer"
              >
                DVLA vehicle record
              </a>
              <a
                href="https://www.gov.uk/check-mot-history"
                className="text-link small"
                target="_blank"
                rel="noreferrer"
              >
                Official MOT history
              </a>
            </div>
          </section>
          <Link href="/faq" className="text-link">
            Read the questions & answers
          </Link>
        </div>
      </div>
    </div>
  );
}
