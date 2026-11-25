import Link from "next/link";
import { Icon } from "./ui/Icon";
export function ReportUpsell() {
  return (
    <section className="card upsell">
      <span className="badge">Full report · in preparation</span>
      <h2>
        There is more
        <br />
        to a car’s history.
      </h2>
      <p>The free check does not include the following records.</p>
      <ul>
        {[
          "Outstanding finance",
          "Stolen vehicle records",
          "Insurance write-offs",
          "Plate changes & valuation",
        ].map((item) => (
          <li key={item}>
            <Icon name="lock" size={16} />
            {item}
          </li>
        ))}
      </ul>
      <div className="price">
        £5.99 <small>incl. VAT</small>
      </div>
      <p>One-time payment. No subscription.</p>
      <Link href="/pricing" className="button button-primary">
        See full report details
      </Link>
      <p className="availability-note">
        Paid checks and checkout are not yet available.
      </p>
    </section>
  );
}
