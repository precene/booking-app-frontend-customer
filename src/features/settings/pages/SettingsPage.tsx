import { useState, type SubmitEvent } from "react";
import { Bell, CreditCard, Lock, Mail, MapPin, Phone, UserRound } from "lucide-react";

import { useAuthStore } from "#/features/auth/store/authStore";
import {
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";

import { SettingsFormCard } from "../components/SettingsFormCard";
import {
  emailSettingsSchema,
  notificationSettingsSchema,
  passwordSettingsSchema,
  paymentSettingsSchema,
  profileSettingsSchema,
  type EmailSettingsPayload,
  type NotificationSettingsPayload,
  type PasswordSettingsPayload,
  type PaymentSettingsPayload,
  type ProfileSettingsPayload,
} from "../validations/settingsValidation";

const cities = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", "Chitwan"];
const unsupportedSettingsMessage =
  "This setting is ready in the customer UI, but the backend does not expose a customer settings endpoint yet.";

function SettingsPage() {
  const customer = useAuthStore((state) => state.customer);

  const [profile, setProfile] = useState<ProfileSettingsPayload>({
    fullName: customer?.fullName ?? "",
    phone: customer?.phone ?? "",
    city: cities[0],
  });
  const [email, setEmail] = useState<EmailSettingsPayload>({ email: "" });
  const [password, setPassword] = useState<PasswordSettingsPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState<NotificationSettingsPayload>({
    sendBookingNotifications: true,
  });
  const [payment, setPayment] = useState<PaymentSettingsPayload>({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  const [profileErrors, setProfileErrors] = useState<FormValidationErrors<ProfileSettingsPayload>>(
    {},
  );
  const [emailErrors, setEmailErrors] = useState<FormValidationErrors<EmailSettingsPayload>>({});
  const [passwordErrors, setPasswordErrors] = useState<
    FormValidationErrors<PasswordSettingsPayload>
  >({});
  const [paymentErrors, setPaymentErrors] = useState<FormValidationErrors<PaymentSettingsPayload>>(
    {},
  );
  const [statusByForm, setStatusByForm] = useState<Record<string, string | null>>({});

  function clearStatus(form: string) {
    setStatusByForm((currentStatus) => ({ ...currentStatus, [form]: null }));
  }

  function handleProfileSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = profileSettingsSchema.safeParse(profile);

    if (!validation.success) {
      setProfileErrors(getFormValidationErrors(validation.error));
      return;
    }

    setProfileErrors({});
    setStatusByForm((currentStatus) => ({ ...currentStatus, profile: unsupportedSettingsMessage }));
  }

  function handleEmailSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = emailSettingsSchema.safeParse(email);

    if (!validation.success) {
      setEmailErrors(getFormValidationErrors(validation.error));
      return;
    }

    setEmailErrors({});
    setStatusByForm((currentStatus) => ({ ...currentStatus, email: unsupportedSettingsMessage }));
  }

  function handlePasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = passwordSettingsSchema.safeParse(password);

    if (!validation.success) {
      setPasswordErrors(getFormValidationErrors(validation.error));
      return;
    }

    setPasswordErrors({});
    setStatusByForm((currentStatus) => ({
      ...currentStatus,
      password: unsupportedSettingsMessage,
    }));
  }

  function handleNotificationSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = notificationSettingsSchema.safeParse(notifications);

    if (!validation.success) {
      return;
    }

    setStatusByForm((currentStatus) => ({
      ...currentStatus,
      notifications: unsupportedSettingsMessage,
    }));
  }

  function handlePaymentSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = paymentSettingsSchema.safeParse(payment);

    if (!validation.success) {
      setPaymentErrors(getFormValidationErrors(validation.error));
      return;
    }

    setPaymentErrors({});
    setStatusByForm((currentStatus) => ({ ...currentStatus, payment: unsupportedSettingsMessage }));
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-primary text-sm font-medium">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">Account Settings</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          Manage your customer details, login credentials, notifications, and payment preferences.
        </p>
      </section>

      <section className="grid gap-6">
        <SettingsFormCard
          title="Profile Details"
          description="Update your name, phone number, and preferred city for a smoother checkout."
          submitLabel="Save Profile"
          status={statusByForm.profile}
          onSubmit={handleProfileSubmit}
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
                  aria-describedby={profileErrors.fullName ? "fullName-error" : undefined}
                  aria-invalid={Boolean(profileErrors.fullName)}
                  id="fullName"
                  className="pl-9"
                  value={profile.fullName}
                  onChange={(event) => {
                    setProfile((currentProfile) => ({
                      ...currentProfile,
                      fullName: event.target.value,
                    }));
                    setProfileErrors((currentErrors) => ({
                      ...currentErrors,
                      fullName: undefined,
                    }));
                    clearStatus("profile");
                  }}
                />
              </div>
              {profileErrors.fullName ? (
                <p className="text-destructive text-sm" id="fullName-error">
                  {profileErrors.fullName}
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
                  aria-describedby={profileErrors.phone ? "phone-error" : undefined}
                  aria-invalid={Boolean(profileErrors.phone)}
                  id="phone"
                  className="pl-9"
                  value={profile.phone}
                  onChange={(event) => {
                    setProfile((currentProfile) => ({
                      ...currentProfile,
                      phone: event.target.value,
                    }));
                    setProfileErrors((currentErrors) => ({ ...currentErrors, phone: undefined }));
                    clearStatus("profile");
                  }}
                />
              </div>
              {profileErrors.phone ? (
                <p className="text-destructive text-sm" id="phone-error">
                  {profileErrors.phone}
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
                  value={profile.city}
                  onValueChange={(city) => {
                    setProfile((currentProfile) => ({ ...currentProfile, city }));
                    setProfileErrors((currentErrors) => ({ ...currentErrors, city: undefined }));
                    clearStatus("profile");
                  }}
                >
                  <SelectTrigger
                    aria-describedby={profileErrors.city ? "city-error" : undefined}
                    aria-invalid={Boolean(profileErrors.city)}
                    id="city"
                    className="pl-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem value={city} key={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {profileErrors.city ? (
                <p className="text-destructive text-sm" id="city-error">
                  {profileErrors.city}
                </p>
              ) : null}
            </div>
          </div>
        </SettingsFormCard>

        <SettingsFormCard
          title="Email Address"
          description="Change the email used for login, receipts, and booking updates."
          submitLabel="Update Email"
          status={statusByForm.email}
          onSubmit={handleEmailSubmit}
        >
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Current Email</Label>
              <div className="relative">
                <Mail
                  className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  id="currentEmail"
                  className="pl-9"
                  defaultValue={customer?.email ?? ""}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <div className="relative">
                <Mail
                  className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  aria-describedby={emailErrors.email ? "newEmail-error" : undefined}
                  aria-invalid={Boolean(emailErrors.email)}
                  id="newEmail"
                  className="pl-9"
                  type="email"
                  value={email.email}
                  onChange={(event) => {
                    setEmail({ email: event.target.value });
                    setEmailErrors({});
                    clearStatus("email");
                  }}
                />
              </div>
              {emailErrors.email ? (
                <p className="text-destructive text-sm" id="newEmail-error">
                  {emailErrors.email}
                </p>
              ) : null}
            </div>
          </div>
        </SettingsFormCard>

        <SettingsFormCard
          title="Password"
          description="Choose a strong password to keep your booking account secure."
          submitLabel="Change Password"
          status={statusByForm.password}
          onSubmit={handlePasswordSubmit}
        >
          <div className="grid gap-5">
            <PasswordField
              error={passwordErrors.currentPassword}
              id="currentPassword"
              label="Current Password"
              value={password.currentPassword}
              onChange={(value) => {
                setPassword((currentPassword) => ({ ...currentPassword, currentPassword: value }));
                setPasswordErrors((currentErrors) => ({
                  ...currentErrors,
                  currentPassword: undefined,
                }));
                clearStatus("password");
              }}
            />
            <PasswordField
              error={passwordErrors.newPassword}
              id="newPassword"
              label="New Password"
              value={password.newPassword}
              onChange={(value) => {
                setPassword((currentPassword) => ({ ...currentPassword, newPassword: value }));
                setPasswordErrors((currentErrors) => ({
                  ...currentErrors,
                  newPassword: undefined,
                }));
                clearStatus("password");
              }}
            />
            <PasswordField
              error={passwordErrors.confirmPassword}
              id="confirmPassword"
              label="Confirm Password"
              value={password.confirmPassword}
              onChange={(value) => {
                setPassword((currentPassword) => ({ ...currentPassword, confirmPassword: value }));
                setPasswordErrors((currentErrors) => ({
                  ...currentErrors,
                  confirmPassword: undefined,
                }));
                clearStatus("password");
              }}
            />
          </div>
        </SettingsFormCard>

        <SettingsFormCard
          title="Notifications"
          description="Control the messages you receive after booking tickets."
          submitLabel="Save Notifications"
          status={statusByForm.notifications}
          onSubmit={handleNotificationSubmit}
        >
          <label
            className="bg-background flex items-start gap-3 rounded-md border p-4"
            htmlFor="bookingNotifications"
          >
            <Checkbox
              id="bookingNotifications"
              checked={notifications.sendBookingNotifications}
              onCheckedChange={(checked) => {
                setNotifications({ sendBookingNotifications: checked === true });
                clearStatus("notifications");
              }}
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

        <SettingsFormCard
          title="Payment Options"
          description="Manage the card used for faster movie ticket checkout."
          submitLabel="Update Card"
          status={statusByForm.payment}
          onSubmit={handlePaymentSubmit}
        >
          <div className="bg-background rounded-md border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                <CreditCard className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">No Saved Card</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Stripe payment methods are not exposed by the backend yet.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <PaymentField
              error={paymentErrors.cardNumber}
              id="cardNumber"
              inputMode="numeric"
              label="Card Number"
              value={payment.cardNumber}
              onChange={(value) => {
                setPayment((currentPayment) => ({ ...currentPayment, cardNumber: value }));
                setPaymentErrors((currentErrors) => ({ ...currentErrors, cardNumber: undefined }));
                clearStatus("payment");
              }}
            />
            <PaymentField
              error={paymentErrors.cardName}
              id="cardName"
              label="Name On Card"
              value={payment.cardName}
              onChange={(value) => {
                setPayment((currentPayment) => ({ ...currentPayment, cardName: value }));
                setPaymentErrors((currentErrors) => ({ ...currentErrors, cardName: undefined }));
                clearStatus("payment");
              }}
            />
            <PaymentField
              error={paymentErrors.expiry}
              id="expiry"
              inputMode="numeric"
              label="Expiry"
              value={payment.expiry}
              onChange={(value) => {
                setPayment((currentPayment) => ({ ...currentPayment, expiry: value }));
                setPaymentErrors((currentErrors) => ({ ...currentErrors, expiry: undefined }));
                clearStatus("payment");
              }}
            />
            <PaymentField
              error={paymentErrors.cvc}
              id="cvc"
              inputMode="numeric"
              label="CVC"
              value={payment.cvc}
              onChange={(value) => {
                setPayment((currentPayment) => ({ ...currentPayment, cvc: value }));
                setPaymentErrors((currentErrors) => ({ ...currentErrors, cvc: undefined }));
                clearStatus("payment");
              }}
            />
          </div>
        </SettingsFormCard>
      </section>
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  inputMode?: "numeric";
  onChange: (value: string) => void;
};

function PasswordField({ error, id, label, onChange, value }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock
          className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          id={id}
          className="pl-9"
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PaymentField({ error, id, inputMode, label, onChange, value }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-destructive text-sm" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { SettingsPage };
