import { useEffect } from "react";

import { useAuthStore } from "#/features/auth/store/authStore";

import { EmailSettingsForm } from "../components/EmailSettingsForm";
import { NotificationSettingsForm } from "../components/NotificationSettingsForm";
import { PasswordSettingsForm } from "../components/PasswordSettingsForm";
import { PaymentSettingsForm } from "../components/PaymentSettingsForm";
import { ProfileSettingsForm } from "../components/ProfileSettingsForm";
import { useSettingsStore } from "../store/settingsStore";

function SettingsPage() {
  const updateCustomer = useAuthStore((state) => state.updateCustomer);
  const errorMessage = useSettingsStore((state) => state.errorMessage);
  const isLoadingSettings = useSettingsStore((state) => state.isLoadingSettings);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    void loadSettings(updateCustomer);
  }, [loadSettings, updateCustomer]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-primary text-sm font-medium">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">Account Settings</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          Manage your customer details, login credentials, notifications, and payment preferences.
        </p>
        {isLoadingSettings ? (
          <p className="text-muted-foreground mt-3 text-sm">Loading account settings...</p>
        ) : null}
        {errorMessage ? <p className="text-destructive mt-3 text-sm">{errorMessage}</p> : null}
      </section>

      <section className="grid gap-6">
        <ProfileSettingsForm />
        <EmailSettingsForm />
        <PasswordSettingsForm />
        <NotificationSettingsForm />
        <PaymentSettingsForm />
      </section>
    </div>
  );
}

export { SettingsPage };
