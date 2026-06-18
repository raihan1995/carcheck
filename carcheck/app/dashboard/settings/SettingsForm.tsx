"use client";

import { FormEvent, useEffect, useState } from "react";

import { AuthField } from "@/app/components/auth/AuthField";
import { PASSWORD_HINT, validatePassword } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function SettingsForm() {
  const [loading, setLoading] = useState(true);
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
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, surname")
        .eq("id", user.id)
        .maybeSingle();

      const p = profile as Pick<Profile, "first_name" | "surname"> | null;
      setFirstName(p?.first_name ?? (user.user_metadata?.first_name as string) ?? "");
      setSurname(p?.surname ?? (user.user_metadata?.surname as string) ?? "");
      setLoading(false);
    }
    load();
  }, []);

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
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          surname: surname.trim(),
        })
        .eq("id", user.id);

      if (error) {
        setProfileError(error.message);
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
      const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
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

  if (loading) {
    return <p className="text-muted text-sm">Loading settings…</p>;
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Profile</h2>
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
        {profileError && <p className="text-sm text-red-400">{profileError}</p>}
        {profileMessage && <p className="text-sm text-emerald-400">{profileMessage}</p>}
        <button
          type="submit"
          disabled={savingProfile}
          className="min-h-[44px] px-5 rounded-xl bg-surface border border-card-border text-sm font-medium hover:bg-surface/80 disabled:opacity-60"
        >
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form onSubmit={handleEmailSubmit} className="space-y-4 pt-6 border-t border-card-border">
        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Email</h2>
        <AuthField
          id="settings-email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={savingEmail}
        />
        {emailError && <p className="text-sm text-red-400">{emailError}</p>}
        {emailMessage && <p className="text-sm text-emerald-400">{emailMessage}</p>}
        <button
          type="submit"
          disabled={savingEmail}
          className="min-h-[44px] px-5 rounded-xl bg-surface border border-card-border text-sm font-medium hover:bg-surface/80 disabled:opacity-60"
        >
          {savingEmail ? "Saving…" : "Update email"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-6 border-t border-card-border">
        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Password</h2>
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
        {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
        {passwordMessage && <p className="text-sm text-emerald-400">{passwordMessage}</p>}
        <button
          type="submit"
          disabled={savingPassword}
          className="min-h-[44px] px-5 rounded-xl bg-surface border border-card-border text-sm font-medium hover:bg-surface/80 disabled:opacity-60"
        >
          {savingPassword ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
