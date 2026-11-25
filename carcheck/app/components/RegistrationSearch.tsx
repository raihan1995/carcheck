"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./ui/Icon";
import { PlateBand } from "./PlateBand";

export function RegistrationSearch({
  compact = false,
  label = "Enter a UK registration",
  button = "Check vehicle",
}: {
  compact?: boolean;
  label?: string;
  button?: string;
}) {
  const id = useId();
  const router = useRouter();
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    const reg = plate.replace(/\s/g, "").toUpperCase();
    if (!/^[A-Z0-9]{2,8}$/.test(reg)) {
      setError("Enter a UK registration, for example AB12 CDE.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/vehicle/${encodeURIComponent(reg)}`);
  }
  return (
    <form
      onSubmit={submit}
      className={`registration-search${compact ? " search-compact" : ""}`}
      aria-busy={loading}
    >
      <label htmlFor={id}>{label}</label>
      <div className="search-control">
        <PlateBand className="input-country" />
        <input
          id={id}
          value={plate}
          onChange={(e) => {
            setPlate(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="AB12 CDE"
          maxLength={12}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          disabled={loading}
        />
        <button
          className="button button-primary"
          type="submit"
          disabled={loading}
        >
          <Icon name="search" size={18} />
          {loading ? "Opening…" : button}
        </button>
      </div>
      {error && (
        <p className="form-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
