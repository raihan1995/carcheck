import Link from "next/link";
import { HeroVehicle } from "./components/HeroVehicle";
import { RegistrationSearch } from "./components/RegistrationSearch";
import { RecentChecks } from "./components/RecentChecks";
import { RegistrationPlate } from "./components/RegistrationPlate";
import { Icon, type IconName } from "./components/ui/Icon";
import { FeatureComparison } from "./components/FeatureComparison";
import { FaqList } from "./components/FaqList";
const trust: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: "shield",
    title: "Official records",
    detail: "Free data from DVLA & DVSA",
  },
  {
    icon: "file",
    title: "A copy to keep",
    detail: "PDF in the planned full report",
  },
  { icon: "lock", title: "Secure checkout", detail: "Payments in preparation" },
  {
    icon: "check",
    title: "£5.99 incl. VAT",
    detail: "One-time full report price",
  },
];
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              <span>RevVeal</span> your
              <br />
              car&apos;s history.
            </h1>
            <p className="hero-description">
              Every car has a past. Enter its registration to reveal the MOT
              history, mileage records and tax status. Start with a free check.
            </p>
            <RegistrationSearch button="Check now" />
            <p className="search-note">Free to check. No account needed.</p>
            <RecentChecks />
          </div>
          <HeroVehicle />
        </div>
      </section>
      <div className="trust-strip">
        <div className="container trust-points">
          {trust.map((item) => (
            <div className="trust-item" key={item.title}>
              <Icon name={item.icon} size={24} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="section" id="report-contents">
        <div className="container comparison-layout">
          <div className="comparison-aside">
            <span className="eyebrow">Know what is included</span>
            <h2>
              The essentials.
              <br />
              And the fuller picture.
            </h2>
            <p>
              The free check brings the MOT, mileage and tax records together.
              Separate paid checks can help you look further into a car’s past.
            </p>
            <p>
              Full report: <strong>£5.99 incl. VAT.</strong>
              <br />
              One payment. No subscription.
            </p>
            <Link href="/pricing" className="text-link">
              View report details
            </Link>
            <p className="availability-note">
              Full reports are in preparation. Free checks are available now.
            </p>
          </div>
          <FeatureComparison />
        </div>
      </section>
      <section className="sample-band section">
        <div className="container sample-band-inner">
          <div>
            <span className="eyebrow">Read it before you need it</span>
            <h2>
              A report you can
              <br />
              make sense of.
            </h2>
            <p className="muted">
              Clear test results. Mileage in order. Advisories written out in
              full. Take a look at an example before checking a car of your own.
            </p>
            <Link href="/vehicle/SAMPLE" className="button button-primary">
              View sample report
            </Link>
          </div>
          <div className="report-preview">
            <div className="report-preview-top">
              <RegistrationPlate registration="SAMPLE" />
              <span className="badge">Illustrative report</span>
            </div>
            <div className="preview-row">
              <span>MOT history</span>
              <span>
                <Icon name="check" size={16} />
                Test records
              </span>
            </div>
            <div className="preview-row">
              <span>Recorded mileage</span>
              <span>
                <Icon name="check" size={16} />
                Timeline included
              </span>
            </div>
            <div className="preview-row">
              <span>Tax status</span>
              <span>
                <Icon name="check" size={16} />
                DVLA information
              </span>
            </div>
            <div className="preview-row">
              <span>Finance & write-off</span>
              <span className="preview-locked">
                <Icon name="lock" size={16} />
                Separate paid checks
              </span>
            </div>
            <p className="small muted" style={{ margin: "24px 0 0" }}>
              Sample data only. No real vehicle is being checked.
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container faq-layout">
          <div>
            <span className="eyebrow">Before you check</span>
            <h2>A few useful answers.</h2>
            <p className="muted">
              What the records tell you, and what they do not.
            </p>
            <Link href="/faq" className="text-link">
              All questions & answers
            </Link>
          </div>
          <FaqList limit={4} />
        </div>
      </section>
    </>
  );
}
