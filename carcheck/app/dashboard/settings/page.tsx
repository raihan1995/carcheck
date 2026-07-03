import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Settings | RevVeal",
};

export default function SettingsPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="mt-2 text-sm text-muted-strong mb-8">Update your account details.</p>
      <SettingsForm />
    </section>
  );
}
