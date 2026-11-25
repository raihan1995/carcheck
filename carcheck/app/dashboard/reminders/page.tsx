"use client";
import { useState, type FormEvent } from "react";
import {
  useGarage,
  updateGarage,
  type LocalReminder,
} from "@/lib/browser-garage";
import { RegistrationPlate } from "@/app/components/RegistrationPlate";
import { Icon } from "@/app/components/ui/Icon";
import { formatDate } from "@/lib/vehicle-summary";
export default function RemindersPage() {
  const { reminders } = useGarage();
  const [registration, setRegistration] = useState("");
  const [due, setDue] = useState("");
  const [kind, setKind] = useState("MOT");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function add(e: FormEvent) {
    e.preventDefault();
    const reg = registration.replace(/\s/g, "").toUpperCase();
    if (!/^[A-Z0-9]{2,8}$/.test(reg) || !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
      setError("Enter a valid registration and reminder date.");
      return;
    }
    try {
      updateGarage((data) => ({
        ...data,
        reminders: [
          ...data.reminders,
          { id: crypto.randomUUID(), registration: reg, kind, due },
        ].sort((a, b) => a.due.localeCompare(b.due)),
      }));
      setRegistration("");
      setDue("");
      setError("");
      setMessage(
        "Date saved on this browser. Download the calendar entry to receive a reminder in your calendar app.",
      );
    } catch {
      setError("This browser could not save the reminder.");
    }
  }
  function download(item: LocalReminder) {
    const day = item.due.replaceAll("-", "");
    const next = new Date(item.due + "T00:00:00Z");
    next.setUTCDate(next.getUTCDate() + 1);
    const end = next.toISOString().slice(0, 10).replaceAll("-", "");
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+Z/, "Z");
    const text = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//RevVeal//Reminder//EN",
      "BEGIN:VEVENT",
      `UID:${item.id}@revveal`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${item.kind} - ${item.registration}`,
      "DESCRIPTION:Check the official expiry date. Saved from RevVeal.",
      "BEGIN:VALARM",
      "TRIGGER:-P7D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Vehicle reminder",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/calendar;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.registration}-${item.kind}.ics`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h1>Reminders</h1>
          <p>A place for MOT and tax dates you do not want to miss.</p>
        </div>
      </div>
      <div className="notice" style={{ marginBottom: 24 }}>
        <Icon name="info" />
        <p>
          Dates are saved on this browser. RevVeal does not send email, SMS or
          WhatsApp reminders yet. Download an entry to add it to your own
          calendar.
        </p>
      </div>
      <form
        className="card card-body"
        onSubmit={add}
        style={{ marginBottom: 32 }}
      >
        <h2 style={{ fontSize: "var(--text-20)" }}>Add a reminder date</h2>
        <div className="data-columns">
          <div className="field">
            <label htmlFor="reminder-reg">Registration</label>
            <input
              id="reminder-reg"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="AB12 CDE"
              maxLength={12}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reminder-kind">Reminder type</label>
            <select
              id="reminder-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option>MOT</option>
              <option>Tax</option>
              <option>Service</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="reminder-date">Reminder date</label>
          <input
            type="date"
            id="reminder-date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="form-success" role="status">
            {message}
          </p>
        )}
        <button className="button button-primary" type="submit">
          Save date
        </button>
      </form>
      {reminders.length ? (
        <ul className="vehicle-list">
          {reminders.map((item) => (
            <li className="card card-body" key={item.id}>
              <div
                className="button-row"
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <RegistrationPlate registration={item.registration} compact />
                  <p className="small" style={{ margin: "12px 0 0" }}>
                    {item.kind} · {formatDate(item.due)}
                  </p>
                </div>
                <div className="button-row">
                  <button
                    className="button button-secondary"
                    onClick={() => download(item)}
                  >
                    <Icon name="download" size={18} />
                    Calendar entry
                  </button>
                  <button
                    className="button button-ghost icon-button"
                    aria-label={`Remove ${item.kind} reminder for ${item.registration}`}
                    onClick={() => {
                      try {
                        updateGarage((data) => ({
                          ...data,
                          reminders: data.reminders.filter(
                            (r) => r.id !== item.id,
                          ),
                        }));
                      } catch {
                        setError("Could not remove the reminder.");
                      }
                    }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card empty-state">
          <Icon name="bell" size={28} />
          <h2>No reminder dates yet</h2>
          <p>Add a registration and a date above.</p>
        </div>
      )}
    </>
  );
}
