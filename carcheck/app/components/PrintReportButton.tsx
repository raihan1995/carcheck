"use client";
import { Icon } from "./ui/Icon";
export function PrintReportButton() {
  return (
    <button
      type="button"
      className="button button-secondary no-print"
      onClick={() => window.print()}
    >
      <Icon name="download" size={18} />
      Save as PDF
    </button>
  );
}
