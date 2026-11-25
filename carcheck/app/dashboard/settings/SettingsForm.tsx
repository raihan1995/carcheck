"use client";

import { FormEvent, useEffect, useState } from "react";

import { AuthField } from "@/app/components/auth/AuthField";
import { PASSWORD_HINT, validatePassword } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function SettingsForm() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(async () => {
        setLoading(true);
        setLoadError("");
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user)
          throw new Error("Please sign in again to load your settings.");
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name,surname")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (!active) return;
        const p = profile as Pick<Profile, "first_name" | "surname"> | null;
        setEmail(user.email ?? "");
        setFirstName(p?.first_name ?? user.user_metadata?.first_name ?? "");
        setSurname(p?.surname ?? user.user_metadata?.surname ?? "");
      })
      .catch(() => {
        if (active)
          setLoadError(
            "Your settings could not be loaded. Please try again or sign in again.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProfileError("Please sign in again before saving.");
        return;
      }

      const { data: updated, error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          surname: surname.trim(),
        })
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        setProfileError(error.message);
        return;
      }
      if (!updated) {
        setProfileError(
          "Your profile is not available yet. Please contact support.",
        );
        return;
      }
      setProfileMessage("Profile updated.");
    } catch {
      setProfileError("Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailMessage(null);
    setEmailError(null);
    setSavingEmail(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: email.trim().toLowerCase(),
      });
      if (error) {
        setEmailError(error.message);
        return;
      }
      setEmailMessage("Check your inbox to confirm your new email address.");
    } catch {
      setEmailError("Could not update email.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    const err = validatePassword(newPassword);
    if (err) {
      setPasswordError(err);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setPasswordError(error.message);
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } catch {
      setPasswordError("Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loadError)
    return (
      <div role="alert">
        <p className="form-error">{loadError}</p>
        <button
          className="button button-secondary"
          onClick={() => setLoadAttempt((a) => a + 1)}
        >
          Try again
        </button>
      </div>
    );

  if (loading) {
    return (
      <p role="status" className="text-muted text-sm">
        Loading settings…
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <h2 className="kicker text-accent-text">Profile</h2>
        <p className="text-sm text-muted -mt-2">
          Add your name anytime — used to personalise your dashboard.
        </p>
        <AuthField
          id="settings-firstName"
          label="First name"
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
          disabled={savingProfile}
          hint="Optional"
        />
        <AuthField
          id="settings-surname"
          label="Surname"
          value={surname}
          onChange={setSurname}
          autoComplete="family-name"
          disabled={savingProfile}
          hint="Optional"
        />
        {profileError && (
          <p role="alert" className="form-error">
            {profileError}
          </p>
        )}
        {profileMessage && (
          <p role="status" className="form-success">
            {profileMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={savingProfile}
          className="button button-secondary"
        >
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={handleEmailSubmit}
        className="space-y-4 pt-8 border-t border-hairline"
      >
        <h2 className="kicker text-accent-text">Email</h2>
        <AuthField
          id="settings-email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={savingEmail}
        />
        {emailError && (
          <p role="alert" className="form-error">
            {emailError}
          </p>
        )}
        {emailMessage && (
          <p role="status" className="form-success">
            {emailMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={savingEmail}
          className="button button-secondary"
        >
          {savingEmail ? "Saving…" : "Update email"}
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 pt-8 border-t border-hairline"
      >
        <h2 className="kicker text-accent-text">Password</h2>
        <AuthField
          id="settings-password"
          label="New password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          disabled={savingPassword}
          hint={PASSWORD_HINT}
        />
        <AuthField
          id="settings-confirmPassword"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          disabled={savingPassword}
        />
        {passwordError && (
          <p role="alert" className="form-error">
            {passwordError}
          </p>
        )}
        {passwordMessage && (
          <p role="status" className="form-success">
            {passwordMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={savingPassword}
          className="button button-secondary"
        >
          {savingPassword ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
