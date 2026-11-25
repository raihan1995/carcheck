"use client";
import { useGarage } from "@/lib/browser-garage";
import { GarageList } from "@/app/components/dashboard/GarageList";
import { RegistrationSearch } from "@/app/components/RegistrationSearch";
export default function CarsPage() {
  const { cars } = useGarage();
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h1>My cars</h1>
          <p>Keep the registrations you want to come back to.</p>
        </div>
      </div>
      <div className="card card-body" style={{ marginBottom: 24 }}>
        <RegistrationSearch label="Check a car, then choose ‘Save car’" />
      </div>
      <GarageList
        cars={cars}
        empty="Run a vehicle check and select ‘Save car’ to keep it here."
        removable
      />
      <p className="dashboard-small-note" style={{ marginTop: 24 }}>
        Saved on this browser only. Clearing browser data removes this list.
      </p>
    </>
  );
}
