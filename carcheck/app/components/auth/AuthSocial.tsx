"use client";

import { useState } from "react";

import { buildAuthCallbackUrl } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type AuthGoogleButtonProps = {
  nextPath?: string | null;
  disabled?: boolean;
  onError: (message: string) => void;
  onClearMessages?: () => void;
};

export function AuthGoogleButton({
  nextPath,
  disabled = false,
  onError,
  onClearMessages,
}: AuthGoogleButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    onClearMessages?.();
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = buildAuthCallbackUrl(window.location.origin, nextPath);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        onError(error.message);
        setLoading(false);
      }
    } catch {
      onError("Could not start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className="w-full min-h-[48px] rounded-xl border border-card-border bg-surface text-foreground font-semibold hover:bg-surface/80 disabled:opacity-60 transition-all flex items-center justify-center gap-3"
    >
      <GoogleIcon />
      {loading ? "Redirecting to Google…" : "Continue with Google"}
    </button>
  );
}

type AuthMagicLinkButtonProps = {
  email: string;
  nextPath?: string | null;
  disabled?: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages?: () => void;
};

export function AuthMagicLinkButton({
  email,
  nextPath,
  disabled = false,
  onError,
  onSuccess,
  onClearMessages,
}: AuthMagicLinkButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleMagicLink() {
    onClearMessages?.();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      onError("Enter your email address first.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      onError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const emailRedirectTo = buildAuthCallbackUrl(window.location.origin, nextPath);
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo },
      });
      if (error) {
        onError(error.message);
        return;
      }
      onSuccess("Check your email for a sign-in link.");
    } catch {
      onError("Could not send sign-in link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleMagicLink}
      disabled={disabled || loading}
      className="w-full min-h-[44px] rounded-xl border border-card-border bg-surface/50 text-foreground text-sm font-medium hover:bg-surface disabled:opacity-60 transition-all"
    >
      {loading ? "Sending link…" : "Email me a sign-in link"}
    </button>
  );
}
