"use client";
import { useState } from "react";
import { useGarage, updateGarage } from "@/lib/browser-garage";
import { Icon } from "./ui/Icon";
export function SaveCarButton({
  registration,
  make,
  model,
}: {
  registration: string;
  make?: string;
  model?: string;
}) {
  const garage = useGarage();
  const [error, setError] = useState("");
  const saved = garage.cars.some((car) => car.registration === registration);
  function toggle() {
    try {
      updateGarage((data) => ({
        ...data,
        cars: saved
          ? data.cars.filter((car) => car.registration !== registration)
          : [
              { registration, make, model, savedAt: new Date().toISOString() },
              ...data.cars,
            ],
      }));
      setError("");
    } catch {
      setError(
        "Your browser could not save this car. Check your storage settings.",
      );
    }
  }
  return (
    <div>
      <button
        type="button"
        className="button button-secondary"
        aria-pressed={saved}
        onClick={toggle}
      >
        <Icon name={saved ? "check" : "heart"} size={18} />
        {saved ? "Saved on this browser" : "Save car"}
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
