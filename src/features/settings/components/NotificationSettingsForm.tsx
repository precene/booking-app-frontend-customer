import { Bell } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";

import { Checkbox } from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { settingsApi } from "../services/settingsApi";
import { useSettingsStore } from "../store/settingsStore";
import type { NotificationPreference } from "../types/settingsTypes";
import { SettingsFormCard } from "./SettingsFormCard";

const bookingNotificationType = "booking_confirmed";

function NotificationSettingsForm() {
  const notificationPreferences = useSettingsStore((state) => state.notificationPreferences);
  const setNotificationPreferences = useSettingsStore((state) => state.setNotificationPreferences);
  const [sendBookingNotifications, setSendBookingNotifications] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const bookingPreference = notificationPreferences.find(
      (preference) => preference.notificationType === bookingNotificationType,
    );

    if (bookingPreference) {
      setSendBookingNotifications(bookingPreference.enabled);
    }
  }, [notificationPreferences]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitNotifications();
  }

  function updateBookingNotifications(enabled: boolean) {
    setSendBookingNotifications(enabled);
    setStatus(null);
  }

  async function submitNotifications() {
    setStatus(null);
    setIsSubmitting(true);

    try {
      const preference = await settingsApi.updateNotificationPreference({
        enabled: sendBookingNotifications,
        notificationType: bookingNotificationType,
      });

      setNotificationPreferences(upsertNotificationPreference(notificationPreferences, preference));
      toast.success({ title: "Notification Settings Updated Successfully." });
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to update notification settings."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SettingsFormCard
      title="Notifications"
      description="Control the messages you receive after booking tickets."
      submitLabel="Save Notifications"
      status={status}
      statusTone="error"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <label
        className="bg-background flex items-start gap-3 rounded-md border p-4"
        htmlFor="bookingNotifications"
      >
        <Checkbox
          id="bookingNotifications"
          checked={sendBookingNotifications}
          onCheckedChange={(checked) => updateBookingNotifications(checked === true)}
        />
        <span className="grid gap-1">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Bell className="text-primary size-4" aria-hidden="true" />
            Send Notification After Booking
          </span>
          <span className="text-muted-foreground text-sm leading-6">
            Receive booking confirmations, ticket receipts, and reminder messages.
          </span>
        </span>
      </label>
    </SettingsFormCard>
  );
}

function upsertNotificationPreference(
  preferences: NotificationPreference[],
  preference: NotificationPreference,
) {
  const hasPreference = preferences.some(
    (item) => item.notificationType === preference.notificationType,
  );

  if (!hasPreference) {
    return [...preferences, preference];
  }

  return preferences.map((item) =>
    item.notificationType === preference.notificationType ? preference : item,
  );
}

export { NotificationSettingsForm };
