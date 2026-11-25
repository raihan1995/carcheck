export default function Loading() {
  return (
    <div className="container section" role="status">
      <span className="eyebrow">RevVeal</span>
      <h1 style={{ fontSize: "var(--text-28)" }}>Loading…</h1>
      <div className="loading-shimmer" style={{ maxWidth: 480, height: 8 }} />
      <p className="muted" style={{ marginTop: 24 }}>
        Please wait while we load this page.
      </p>
    </div>
  );
}
