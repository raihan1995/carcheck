"use client";

import { useSyncExternalStore } from "react";

export type GarageCar = {
  registration: string;
  make?: string;
  model?: string;
  savedAt: string;
};
export type LocalReminder = {
  id: string;
  registration: string;
  kind: string;
  due: string;
};
export type GarageData = {
  cars: GarageCar[];
  recent: GarageCar[];
  reminders: LocalReminder[];
};
const KEY = "revveal_garage_v1";
// Preserve cars and reminder dates saved during the reference-design preview.
const LEGACY_KEY = "motco_garage_v1";
const EMPTY = '{"cars":[],"recent":[],"reminders":[]}';
let cachedRaw = "";
let cached: GarageData = { cars: [], recent: [], reminders: [] };
const serverSnapshot = cached;
function snapshot(): GarageData {
  let raw = EMPTY;
  try {
    raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || EMPTY;
  } catch {
    /* Private browsing can disable storage. */
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const data = JSON.parse(raw);
    cached = {
      cars: Array.isArray(data.cars) ? data.cars.filter(validCar) : [],
      recent: Array.isArray(data.recent) ? data.recent.filter(validCar) : [],
      reminders: Array.isArray(data.reminders)
        ? data.reminders.filter(
            (r: LocalReminder) =>
              r &&
              typeof r.id === "string" &&
              typeof r.registration === "string" &&
              /^[A-Z0-9]{2,8}$/.test(r.registration) &&
              typeof r.due === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(r.due) &&
              Number.isFinite(Date.parse(r.due)) &&
              ["MOT", "Tax", "Service"].includes(r.kind),
          )
        : [],
    };
  } catch {
    cached = { cars: [], recent: [], reminders: [] };
  }
  return cached;
}
function validCar(value: GarageCar) {
  return (
    value &&
    typeof value.registration === "string" &&
    /^[A-Z0-9]{2,8}$/.test(value.registration) &&
    typeof value.savedAt === "string" &&
    Number.isFinite(Date.parse(value.savedAt))
  );
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("revveal-garage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("revveal-garage", callback);
  };
}
export function useGarage() {
  return useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);
}
export function updateGarage(update: (data: GarageData) => GarageData) {
  const next = update(snapshot());
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("revveal-garage"));
}
export function recordCheck(car: Omit<GarageCar, "savedAt">) {
  updateGarage((data) => ({
    ...data,
    recent: [
      { ...car, savedAt: new Date().toISOString() },
      ...data.recent.filter((r) => r.registration !== car.registration),
    ].slice(0, 12),
  }));
}
