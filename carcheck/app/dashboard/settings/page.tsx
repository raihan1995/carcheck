import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Settings | RevVeal",
};

export default function SettingsPage() {
  return (
    <section>
      <h2 className="font-display text-2xl">Settings</h2>
      <p className="mt-2 text-sm text-muted mb-8">Update your account details.</p>
      <SettingsForm />
    </section>
  );
}
