"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
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
  const [loading, setLoading] = useState(false);

  function safeRedirectPath(path: string | null): string {
    if (!path || !path.startsWith("/") || path.startsWith("//")) return "/dashboard/reports";
    return path;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={loading}
        />
        <p className="text-right">
          <Link href="/forgot-password" className="text-sm text-amber-400 hover:underline font-medium">
            Forgot password?
          </Link>
        </p>
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
          {loading ? "Signing in…" : "Log in"}
        </button>
        <p className="text-center text-sm text-muted pt-2">
          Haven&apos;t got a free account yet?{" "}
          <Link href="/register" className="text-amber-400 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
