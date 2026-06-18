"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthDivider } from "@/app/components/auth/AuthDivider";
import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { AuthGoogleButton, AuthMagicLinkButton } from "@/app/components/auth/AuthSocial";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    authError === "auth_callback" ? "Sign-in link expired or invalid. Try again." : null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerHref = nextPath
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : "/register";

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        setError("Invalid email or password.");
        return;
      }
      router.push(safeRedirectPath(nextPath));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Login" subtitle="Sign in to your RevVeal account.">
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
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />

        <AuthMagicLinkButton
          email={email}
          nextPath={nextPath}
          disabled={loading}
          onError={setError}
          onSuccess={setSuccess}
          onClearMessages={clearMessages}
        />

        <AuthDivider label="or use password" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={loading}
          />
          <p className="text-right -mt-2">
            <Link href="/forgot-password" className="text-sm text-amber-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </p>
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
            {loading ? "Signing in…" : "Log in with password"}
          </button>
          <p className="text-center text-sm text-muted pt-2">
            Haven&apos;t got a free account yet?{" "}
            <Link href={registerHref} className="text-amber-400 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
