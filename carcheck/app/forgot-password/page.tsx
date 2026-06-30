"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { buildAuthCallbackUrl } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: buildAuthCallbackUrl("/reset-password") }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSuccess("If an account exists for that email, we sent password reset instructions.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a link to reset your password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-400 font-medium" role="status">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-md bg-accent text-background font-medium hover:bg-accent-strong disabled:opacity-60 transition-colors"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <p className="text-center text-sm text-muted pt-2">
          <Link href="/login" className="link-underline text-accent font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
