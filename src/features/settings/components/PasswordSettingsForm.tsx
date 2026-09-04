import { useNavigate } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";

import { useAuthStore } from "#/features/auth/store/authStore";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";

import { settingsApi } from "../services/settingsApi";
import {
  passwordSettingsSchema,
  type PasswordSettingsPayload,
} from "../validations/settingsValidation";
import { SettingsFormCard } from "./SettingsFormCard";
import { SettingsPasswordField } from "./SettingsPasswordField";

const initialPassword: PasswordSettingsPayload = {
  confirmPassword: "",
  currentPassword: "",
  newPassword: "",
};

function PasswordSettingsForm() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [form, setForm] = useState<PasswordSettingsPayload>(initialPassword);
  const [errors, setErrors] = useState<FormValidationErrors<PasswordSettingsPayload>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPassword();
  }

  function updateField<Field extends keyof PasswordSettingsPayload>(
    field: Field,
    value: PasswordSettingsPayload[Field],
  ) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatus(null);
  }

  async function submitPassword() {
    const validation = passwordSettingsSchema.safeParse(form);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    try {
      await settingsApi.changePassword({
        currentPassword: validation.data.currentPassword,
        newPassword: validation.data.newPassword,
      });

      setForm(initialPassword);
      toast.success({ title: "Password Changed Successfully." });
      logout();
      void navigate({ to: "/login" });
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to change password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SettingsFormCard
      title="Password"
      description="Choose a strong password to keep your booking account secure."
      submitLabel="Change Password"
      status={status}
      statusTone="error"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <SettingsPasswordField
          error={errors.currentPassword}
          id="currentPassword"
          label="Current Password"
          value={form.currentPassword}
          onChange={(value) => updateField("currentPassword", value)}
        />
        <SettingsPasswordField
          error={errors.newPassword}
          id="newPassword"
          label="New Password"
          value={form.newPassword}
          onChange={(value) => updateField("newPassword", value)}
        />
        <SettingsPasswordField
          error={errors.confirmPassword}
          id="confirmPassword"
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
        />
      </div>
    </SettingsFormCard>
  );
}

export { PasswordSettingsForm };
