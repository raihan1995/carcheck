import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <section>
      <div className="dashboard-heading">
        <div>
          <h1>Settings</h1>
          <p>Profile details, email and password.</p>
        </div>
      </div>
      <div className="card card-body">
        <SettingsForm />
      </div>
    </section>
  );
}
