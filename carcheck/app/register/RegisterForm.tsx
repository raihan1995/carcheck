"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthDivider } from "@/app/components/auth/AuthDivider";
import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { AuthGoogleButton, AuthMagicLinkButton } from "@/app/components/auth/AuthSocial";
import { buildAuthCallbackUrl, safeRedirectPath } from "@/lib/auth/redirect";
import { PASSWORD_HINT, validateRegisterFields } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearMessages();

    const errors = validateRegisterFields({
      email,
      password,
      confirmPassword,
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const emailRedirectTo = buildAuthCallbackUrl(nextPath);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.push(safeRedirectPath(nextPath));
        router.refresh();
        return;
      }

      setSuccess("Account created. Check your email to confirm your address, then log in.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Sign up for a free RevVeal account.">
      <div className="space-y-6">
        <AuthGoogleButton
          nextPath={nextPath}
          disabled={loading}
          onError={setError}
          onClearMessages={clearMessages}
        />

        <AuthDivider />

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

        <AuthMagicLinkButton
          email={email}
          nextPath={nextPath}
          disabled={loading}
          onError={setError}
          onSuccess={setSuccess}
          onClearMessages={clearMessages}
        />

        <AuthDivider label="or register with password" />

        <form onSubmit={handleSubmit} className="space-y-4">
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
          {success && (
            <p className="text-sm text-emerald-400 font-medium" role="status">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all"
          >
            {loading ? "Creating account…" : "Register with password"}
          </button>
          <p className="text-center text-sm text-muted pt-2">
            Already have an account?{" "}
            <Link href={loginHref} className="text-amber-400 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
