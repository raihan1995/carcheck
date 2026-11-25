"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthDivider } from "@/app/components/auth/AuthDivider";
import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import {
  AuthGoogleButton,
  AuthMagicLinkButton,
} from "@/app/components/auth/AuthSocial";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";
export function LoginForm() {
  const router = useRouter(),
    params = useSearchParams();
  const next = safeRedirectPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("error") === "auth_callback"
      ? "Your sign-in link has expired or is invalid. Please try again."
      : "",
  );
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  function clear() {
    setError("");
    setSuccess("");
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setError("The email or password was not recognised. Please try again.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("We could not reach the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell title="Welcome back." subtitle="Sign in to your RevVeal account.">
      <form onSubmit={submit} className="stack" aria-busy={loading}>
        <AuthGoogleButton
          nextPath={next}
          disabled={loading}
          onError={setError}
          onClearMessages={clear}
        />
        <AuthDivider label="or sign in with email" />
        <div>
          <AuthField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            disabled={loading}
            required
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={loading}
            required
          />
          <p className="small" style={{ textAlign: "right", margin: 0 }}>
            <Link href="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="form-success" role="status">
            {success}
          </p>
        )}
        <button
          className="button button-primary"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <AuthMagicLinkButton
          email={email}
          nextPath={next}
          disabled={loading}
          onError={setError}
          onSuccess={setSuccess}
          onClearMessages={clear}
        />
        <p className="small muted" style={{ margin: 0 }}>
          New to RevVeal?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-link"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
