"use client";
import Link from "next/link";
import { useGarage } from "@/lib/browser-garage";
export function RecentChecks() {
  const { recent } = useGarage();
  if (!recent.length) return null;
  return (
    <section className="recent-searches" aria-label="Recent checks">
      <p>Recent checks</p>
      <ul>
        {recent.slice(0, 3).map((car) => {
          const display = /^[A-Z]{2}\d{2}[A-Z]{3}$/.test(car.registration)
            ? `${car.registration.slice(0, 4)} ${car.registration.slice(4)}`
            : car.registration;
          return (
            <li key={car.registration}>
              <Link href={`/vehicle/${car.registration}`}>{display}</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
