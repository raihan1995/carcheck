"use client";
import Link from "next/link";
import { useGarage } from "@/lib/browser-garage";
import { GarageList } from "./GarageList";
import { Icon } from "../ui/Icon";
export function Watchlist({ kind }: { kind: "logbook" | "tax" }) {
  const { cars } = useGarage();
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h1>{kind === "tax" ? "Tax alerts" : "Logbook"}</h1>
          <p>
            {kind === "tax"
              ? "Keep track of the tax status of your saved cars."
              : "Review the latest V5C issue date for a saved car."}
          </p>
        </div>
      </div>
      <div className="notice" style={{ marginBottom: 32 }}>
        <Icon name="info" />
        <p>
          Automatic {kind === "tax" ? "tax status" : "V5C change"} monitoring is
          in preparation. No notifications are being sent. Open a saved car to
          run a fresh check, or{" "}
          <Link href="/dashboard/reminders">save a reminder date</Link>.
        </p>
      </div>
      <GarageList
        cars={cars}
        empty="Save a car from its free check to see it here."
      />
      <p className="dashboard-small-note" style={{ marginTop: 24 }}>
        {kind === "logbook"
          ? "A V5C issue date alone does not establish a change of keeper. "
          : "Tax status can change after a report is retrieved. "}
        These registrations are saved on this browser.
      </p>
    </>
  );
}
