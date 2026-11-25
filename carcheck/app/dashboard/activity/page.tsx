"use client";
import { useState } from "react";
import { useGarage, updateGarage } from "@/lib/browser-garage";
import { GarageList } from "@/app/components/dashboard/GarageList";
export default function ActivityPage() {
  const { recent } = useGarage();
  const [error, setError] = useState("");
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h1>Activity</h1>
          <p>Recent vehicle checks on this browser.</p>
        </div>
        {recent.length > 0 && (
          <button
            className="button button-secondary"
            onClick={() => {
              try {
                updateGarage((data) => ({ ...data, recent: [] }));
              } catch {
                setError("Could not clear this browser’s history.");
              }
            }}
          >
            Clear history
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <GarageList
        cars={recent}
        empty="Run your first free check to start a recent history."
      />
      <p className="dashboard-small-note" style={{ marginTop: 24 }}>
        This list contains the latest check for each registration. It is not an
        account-wide activity log.
      </p>
    </>
  );
}
