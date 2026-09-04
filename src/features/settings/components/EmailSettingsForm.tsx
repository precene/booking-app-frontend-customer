import { CheckCircle2, Mail } from "lucide-react";
import { useState, type SubmitEvent } from "react";

import { Input, Label } from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";

import { settingsApi } from "../services/settingsApi";
import { useSettingsStore } from "../store/settingsStore";
import { emailSettingsSchema, type EmailSettingsPayload } from "../validations/settingsValidation";
import { SettingsFormCard } from "./SettingsFormCard";

function EmailSettingsForm() {
  const currentEmail = useSettingsStore((state) => state.profile?.email ?? "");
  const [form, setForm] = useState<EmailSettingsPayload>({ newEmail: "" });
  const [errors, setErrors] = useState<FormValidationErrors<EmailSettingsPayload>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitEmail();
  }

  function updateEmail(value: string) {
    setForm({ newEmail: value });
    setErrors({});
    setStatus(null);
  }

  async function submitEmail() {
    const validation = emailSettingsSchema.safeParse(form);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    try {
      const result = await settingsApi.requestEmailChange({
        newEmail: validation.data.newEmail,
      });

      setForm({ newEmail: "" });
      toast.success({
        description: result.message || "Please verify it to update login.",
        title: "Verification Email Sent.",
      });
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to request email change."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SettingsFormCard
      title="Email Address"
      description="Change the email used for login, receipts, and booking updates."
      submitLabel="Update Email"
      status={status}
      statusTone="error"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <div className="bg-background flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Mail className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Current Email Address</p>
              <p className="text-muted-foreground mt-1 text-sm">{currentEmail}</p>
            </div>
          </div>

          <span className="bg-success/10 text-success inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEmail">New Email</Label>
          <div className="relative">
            <Mail
              className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              aria-describedby={errors.newEmail ? "newEmail-error" : undefined}
              aria-invalid={Boolean(errors.newEmail)}
              id="newEmail"
              className="pl-9"
              type="email"
              value={form.newEmail}
              onChange={(event) => updateEmail(event.target.value)}
            />
          </div>
          {errors.newEmail ? (
            <p className="text-destructive text-sm" id="newEmail-error">
              {errors.newEmail}
            </p>
          ) : null}
        </div>
      </div>
    </SettingsFormCard>
  );
}

export { EmailSettingsForm };
