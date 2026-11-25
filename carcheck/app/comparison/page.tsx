import Link from "next/link";
import { FeatureComparison } from "@/app/components/FeatureComparison";
import { Icon } from "@/app/components/ui/Icon";
export const metadata = { title: "Compare the free check and full report" };
export default function ComparisonPage() {
  return (
    <div className="container section">
      <span className="eyebrow">Choose the information you need</span>
      <h1 style={{ fontSize: "var(--text-40)" }}>
        Compare the free check
        <br />
        and full report.
      </h1>
      <p className="lead">
        The free check covers available DVLA and MOT records. The planned full
        report adds separate checks for £5.99 incl. VAT.
      </p>
      <div style={{ marginBlock: 32 }}>
        <FeatureComparison />
      </div>
      <div className="notice">
        <Icon name="info" />
        <p>
          This compares the contents of RevVeal&apos;s free check and planned full
          report. Paid checks are not yet available for purchase.
        </p>
      </div>
      <div className="button-row" style={{ marginTop: 32 }}>
        <Link href="/" className="button button-primary">
          Start a free check
        </Link>
        <Link href="/report/SAMPLE" className="button button-secondary">
          View report layout
        </Link>
      </div>
    </div>
  );
}
