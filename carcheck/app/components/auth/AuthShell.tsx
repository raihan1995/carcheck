import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="container">
      <div className="auth-layout">
        <aside className="auth-aside">
          <div>
            <Icon name="car" size={32} />
            <h2>
              Every car has a past.
              <br />RevVeal its story.
            </h2>
            <p>
              Check the records, keep useful registrations and organise the
              dates that matter.
            </p>
          </div>
          <p className="small">
            Independent UK vehicle information.
            <br />
            Not affiliated with the DVLA or DVSA.
          </p>
        </aside>
        <section className="auth-panel">
          <span className="eyebrow">RevVeal account</span>
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          <div className="auth-back">
            <Link href="/">Back to vehicle checks</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
