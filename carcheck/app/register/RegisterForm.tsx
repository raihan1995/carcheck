"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { PASSWORD_HINT } from "@/lib/auth/password";

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, surname, email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(data.error || "Registration failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Sign up for a free RevVeal account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="firstName"
          label="First name"
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
          disabled={loading}
          error={fieldErrors.firstName}
        />
        <AuthField
          id="surname"
          label="Surname"
          value={surname}
          onChange={setSurname}
          autoComplete="family-name"
          disabled={loading}
          error={fieldErrors.surname}
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
          error={fieldErrors.email}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={loading}
          hint={PASSWORD_HINT}
          error={fieldErrors.password}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          disabled={loading}
          error={fieldErrors.confirmPassword}
        />
        {error && (
          <p className="text-sm text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all"
        >
          {loading ? "Creating account…" : "Register"}
        </button>
        <p className="text-center text-sm text-muted pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
