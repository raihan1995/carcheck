import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section">
      <span className="eyebrow">Page not found</span>
      <h1 style={{ fontSize: "var(--text-40)" }}>
        This is not the page
        <br />
        you were looking for.
      </h1>
      <p className="muted">
        The address may have changed, or the page may no longer exist.
      </p>
      <div className="button-row" style={{ marginTop: 32 }}>
        <Link href="/" className="button button-primary">
          Check a vehicle
        </Link>
        <Link href="/guides" className="button button-secondary">
          Read the guides
        </Link>
      </div>
    </div>
  );
}
