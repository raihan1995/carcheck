"use client";
import Link from "next/link";
import { useState } from "react";
import { updateGarage, type GarageCar } from "@/lib/browser-garage";
import { RegistrationPlate } from "../RegistrationPlate";
import { Icon } from "../ui/Icon";
export function GarageList({
  cars,
  empty,
  removable = false,
}: {
  cars: GarageCar[];
  empty: string;
  removable?: boolean;
}) {
  const [error, setError] = useState("");
  function remove(reg: string) {
    try {
      updateGarage((data) => ({
        ...data,
        cars: data.cars.filter((c) => c.registration !== reg),
      }));
      setError("");
    } catch {
      setError("This browser could not update your saved cars.");
    }
  }
  if (!cars.length)
    return (
      <div className="card empty-state">
        <Icon name="car" size={28} />
        <h3>No cars here yet</h3>
        <p>{empty}</p>
        <Link className="button button-secondary" href="/">
          Check a vehicle
        </Link>
      </div>
    );
  return (
    <>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <ul className="vehicle-list">
        {cars.map((car) => (
          <li key={car.registration} className="card vehicle-list-row">
            <Link href={`/vehicle/${car.registration}`}>
              <RegistrationPlate registration={car.registration} compact />
              <span>
                <strong>
                  {[car.make, car.model].filter(Boolean).join(" ") ||
                    "Vehicle check"}
                </strong>
                <small>
                  Last checked{" "}
                  {new Date(car.savedAt).toLocaleDateString("en-GB")}
                </small>
              </span>
            </Link>
            {removable ? (
              <button
                className="button button-ghost icon-button"
                aria-label={`Remove ${car.registration} from saved cars`}
                onClick={() => remove(car.registration)}
              >
                <Icon name="close" size={18} />
              </button>
            ) : (
              <Icon name="chevron" size={18} />
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
