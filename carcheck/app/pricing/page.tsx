import Link from "next/link";
import { FeatureComparison } from "@/app/components/FeatureComparison";
import { FaqList } from "@/app/components/FaqList";
import { Icon } from "@/app/components/ui/Icon";
export const metadata = {
  title: "Pricing",
  description:
    "Free vehicle checks and the planned £5.99 incl. VAT full vehicle report. One-time payment, no subscription.",
};
export default function PricingPage() {
  return (
    <>
      <div className="container page-heading">
        <span className="eyebrow">Simple pricing</span>
        <h1>
          Start free.
          <br />
          Know what comes next.
        </h1>
        <p>
          Check the essentials first. See exactly what the planned full report
          adds.
        </p>
      </div>
      <section className="container section-sm">
        <div className="pricing-grid">
          <div className="card pricing-card">
            <span className="badge">Free check</span>
            <h2 style={{ marginTop: 24 }}>The essential records</h2>
            <p>MOT, mileage and tax information in one place.</p>
            <div className="price">
              £0 <small>No payment needed</small>
            </div>
            <ul>
              {[
                "DVLA vehicle details",
                "MOT results and advisories",
                "Recorded mileage timeline",
                "Current tax status",
              ].map((item) => (
                <li key={item}>
                  <Icon name="check" size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="button button-primary" href="/">
              Check a vehicle for free
            </Link>
          </div>
          <div className="card pricing-card pricing-card-featured">
            <span className="badge">Full report · in preparation</span>
            <h2 style={{ marginTop: 24 }}>The separate risk checks</h2>
            <p>Additional records to consider before you buy.</p>
            <div className="price">
              £5.99 <small>incl. VAT · one-time payment</small>
            </div>
            <ul>
              {[
                "Stolen and outstanding finance checks",
                "Insurance write-off records",
                "Mileage analysis and plate changes",
                "Valuation and PDF copy",
              ].map((item) => (
                <li key={item}>
                  <Icon name="check" size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              className="button button-primary"
              disabled
              aria-describedby="checkout-note"
            >
              Checkout not yet available
            </button>
            <p className="availability-note" id="checkout-note">
              Paid data and payments still need to be connected. No payment will
              be taken.
            </p>
            <Link href="/report/SAMPLE" className="text-link small">
              Preview the full report layout
            </Link>
          </div>
        </div>
      </section>
      <section className="section bg-subtle">
        <div className="container">
          <div className="section-intro">
            <div>
              <span className="eyebrow">The detail</span>
              <h2>Free check or full report?</h2>
              <p>
                The additional checks are not part of the free DVLA and MOT
                record.
              </p>
            </div>
          </div>
          <FeatureComparison />
          <p className="availability-note">
            The full-report column describes the planned service. Availability
            will be confirmed before payments open.
          </p>
        </div>
      </section>
      <section className="container section faq-layout">
        <div>
          <h2>Before you decide.</h2>
          <p className="muted">
            No subscription. No claim that one report can replace an inspection.
          </p>
        </div>
        <FaqList limit={4} />
      </section>
    </>
  );
}
