"use client";
import Link from "next/link";
import { Icon } from "./components/ui/Icon";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container section">
      <div className="card empty-state">
        <Icon name="info" size={32} />
        <h1 style={{ fontSize: "var(--text-28)" }}>
          This page could not be loaded
        </h1>
        <p role="alert">
          Please try again. If the problem continues, return to the vehicle
          check.
        </p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <button className="button button-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="button button-secondary">
            Vehicle check
          </Link>
        </div>
      </div>
    </div>
  );
}
