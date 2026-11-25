"use client";
import Link from "next/link";
import { useGarage } from "@/lib/browser-garage";
import { Icon, type IconName } from "../ui/Icon";
import { GarageList } from "./GarageList";
const actions: {
  href: string;
  icon: IconName;
  title: string;
  detail: string;
}[] = [
  {
    href: "/",
    icon: "search",
    title: "Check a vehicle",
    detail: "Free MOT, tax and mileage records",
  },
  {
    href: "/dashboard/reports",
    icon: "file",
    title: "Your reports",
    detail: "Read a purchased report",
  },
  {
    href: "/dashboard/reminders",
    icon: "bell",
    title: "Manage reminders",
    detail: "Dates to add to your calendar",
  },
  {
    href: "/dashboard/logbook",
    icon: "book",
    title: "Logbook watchlist",
    detail: "Keep the registrations together",
  },
  {
    href: "/dashboard/tax-alerts",
    icon: "shield",
    title: "Tax watchlist",
    detail: "Review your saved registrations",
  },
  {
    href: "/dashboard/settings",
    icon: "settings",
    title: "Account settings",
    detail: "Profile, email and password",
  },
];
export function DashboardHome({
  firstName,
  reportCount,
}: {
  firstName: string;
  reportCount: number | null;
}) {
  const garage = useGarage();
  return (
    <>
      <div className="dashboard-greeting">
        <span className="eyebrow">Your RevVeal account</span>
        <h1>Hello, {firstName}.</h1>
        <p>Your cars, checks and important dates, in one place.</p>
        <div className="button-row">
          <Link href="/" className="button button-primary">
            <Icon name="search" size={18} />
            Check a vehicle
          </Link>
          <Link href="/dashboard/cars" className="button button-secondary">
            <Icon name="plus" size={18} />
            Add a car
          </Link>
        </div>
      </div>
      <div className="stat-grid">
        {[
          { icon: "car", count: garage.cars.length, label: "Saved cars" },
          { icon: "file", count: reportCount ?? "—", label: "Reports" },
          {
            icon: "bell",
            count: garage.reminders.length,
            label: "Reminder dates",
          },
        ].map((stat) => (
          <div className="card stat-card" key={stat.label}>
            <Icon name={stat.icon as IconName} />
            <strong>{stat.count}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      {reportCount === null && (
        <p role="alert" className="form-error">
          Report information could not be loaded.{" "}
          <Link href="/dashboard/reports">Try the reports page</Link>.
        </p>
      )}
      <section className="dashboard-section">
        <div className="dashboard-section-title">
          <h2>Recent cars</h2>
          <Link href="/dashboard/activity">View activity</Link>
        </div>
        <GarageList
          cars={garage.recent.slice(0, 3)}
          empty="Your recent checks will appear here."
        />
      </section>
      <section className="dashboard-section">
        <div className="dashboard-section-title">
          <h2>Quick actions</h2>
        </div>
        <div className="quick-actions">
          {actions.map((action) => (
            <Link
              href={action.href}
              className="card quick-action"
              key={action.href}
            >
              <Icon name={action.icon} />
              <div>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <p className="dashboard-small-note">
        Saved cars, recent checks and reminder dates are stored on this browser.
        They are not yet synchronised with your account. Purchased reports use
        your account.
      </p>
    </>
  );
}
