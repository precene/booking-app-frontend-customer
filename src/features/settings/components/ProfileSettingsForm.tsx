import { MapPin, Phone, UserRound } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";

import { useAuthStore } from "#/features/auth/store/authStore";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";

import { settingsApi } from "../services/settingsApi";
import { useSettingsStore } from "../store/settingsStore";
import {
  profileSettingsSchema,
  type ProfileSettingsPayload,
} from "../validations/settingsValidation";
import { SettingsFormCard } from "./SettingsFormCard";

function ProfileSettingsForm() {
  const cities = useSettingsStore((state) => state.cities);
  const profile = useSettingsStore((state) => state.profile);
  const setProfile = useSettingsStore((state) => state.setProfile);
  const updateCustomer = useAuthStore((state) => state.updateCustomer);
  const [form, setForm] = useState<ProfileSettingsPayload>({
    cityId: null,
    fullName: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormValidationErrors<ProfileSettingsPayload>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      cityId: profile.cityId,
      fullName: profile.fullName,
      phone: profile.phone ?? "",
    });
  }, [profile]);

  function updateField<Field extends keyof ProfileSettingsPayload>(
    field: Field,
    value: ProfileSettingsPayload[Field],
  ) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatus(null);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitProfile();
  }

  async function submitProfile() {
    const validation = profileSettingsSchema.safeParse(form);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    try {
      const updatedProfile = await settingsApi.updateProfile({
        cityId: validation.data.cityId,
        fullName: validation.data.fullName,
        phone: validation.data.phone.trim() ? validation.data.phone.trim() : null,
      });

      setProfile(updatedProfile, updateCustomer);
      toast.success({ title: "Profile Details Updated Successfully." });
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to update profile details."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SettingsFormCard
      title="Profile Details"
      description="Update your name and phone number for a smoother checkout."
      submitLabel="Save Profile"
      status={status}
      statusTone="error"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <UserRound
              className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              aria-invalid={Boolean(errors.fullName)}
              id="fullName"
              className="pl-9"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </div>
          {errors.fullName ? (
            <p className="text-destructive text-sm" id="fullName-error">
              {errors.fullName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone
              className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              aria-describedby={errors.phone ? "phone-error" : undefined}
              aria-invalid={Boolean(errors.phone)}
              id="phone"
              className="pl-9"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>
          {errors.phone ? (
            <p className="text-destructive text-sm" id="phone-error">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <div className="relative">
            <MapPin
              className="text-muted pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Select
              value={form.cityId ?? "none"}
              onValueChange={(value) => updateField("cityId", value === "none" ? null : value)}
            >
              <SelectTrigger
                id="city"
                className="pl-9"
                aria-describedby={errors.cityId ? "city-error" : undefined}
                aria-invalid={Boolean(errors.cityId)}
              >
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No City Selected</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.cityId ? (
            <p className="text-destructive text-sm" id="city-error">
              {errors.cityId}
            </p>
          ) : null}
        </div>
      </div>
    </SettingsFormCard>
  );
}

export { ProfileSettingsForm };
