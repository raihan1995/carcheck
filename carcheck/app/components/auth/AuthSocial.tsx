"use client";

import { useState } from "react";
import { Icon } from "../ui/Icon";

import { buildAuthCallbackUrl } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return <Icon name="user" size={20} />;
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
      const redirectTo = buildAuthCallbackUrl(nextPath);
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
      className="w-full min-h-[48px] rounded-md border border-hairline bg-surface/60 text-foreground font-medium hover:border-foreground/30 hover:bg-surface disabled:opacity-60 transition-colors flex items-center justify-center gap-3"
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
      const emailRedirectTo = buildAuthCallbackUrl(nextPath);
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
      className="w-full min-h-[44px] rounded-md border border-hairline bg-transparent text-muted-strong text-sm font-medium hover:border-foreground/30 hover:text-foreground disabled:opacity-60 transition-colors"
    >
      {loading ? "Sending link…" : "Email me a sign-in link"}
    </button>
  );
}
