import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Settings | RevVeal",
};

export default function SettingsPage() {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Settings</h2>
      <p className="mt-1 text-sm text-muted mb-6">Update your account details.</p>
      <SettingsForm />
    </section>
  );
}
