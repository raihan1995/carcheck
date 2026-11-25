export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand${light ? " brand-light" : ""}`}>
      Rev<span>Veal</span>
      <span className="sr-only"> UK vehicle checks</span>
    </span>
  );
}
