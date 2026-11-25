"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthDivider } from "@/app/components/auth/AuthDivider";
import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { AuthGoogleButton } from "@/app/components/auth/AuthSocial";
import { buildAuthCallbackUrl, safeRedirectPath } from "@/lib/auth/redirect";
import { PASSWORD_HINT, validateRegisterFields } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";
export function RegisterForm() {
  const router = useRouter(),
    params = useSearchParams();
  const next = safeRedirectPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  function clear() {
    setError("");
    setSuccess("");
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    clear();
    const errors = validateRegisterFields({ email, password, confirmPassword });
    setFields(errors);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const { data, error } = await createClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: buildAuthCallbackUrl(next) },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setSuccess("Check your email to confirm your account, then sign in.");
      }
    } catch {
      setError("The account could not be created. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell
      title="Make yourself an account."
      subtitle="Keep your account details and purchased reports together."
    >
      <form className="stack" onSubmit={submit} aria-busy={loading}>
        <AuthGoogleButton
          nextPath={next}
          disabled={loading}
          onError={setError}
          onClearMessages={clear}
        />
        <AuthDivider label="or create an account with email" />
        <div>
          <AuthField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            disabled={loading}
            error={fields.email}
            required
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
            error={fields.password}
            required
          />
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            disabled={loading}
            error={fields.confirmPassword}
            required
          />
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
        <p className="small muted" style={{ margin: 0 }}>
          By creating an account you agree to the{" "}
          <Link href="/terms">terms</Link>. Read how we handle information in
          our <Link href="/privacy">privacy notice</Link>.
        </p>
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Creating your account…" : "Create account"}
        </button>
        <p className="small muted" style={{ margin: 0 }}>
          Already registered?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-link"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
