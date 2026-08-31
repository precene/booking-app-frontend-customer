import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Film, Lock, Mail, ShieldCheck, Ticket } from "lucide-react";

import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import { loginSchema } from "../validations/loginValidation";
import type { LoginPayload } from "../types/authTypes";

import { Alert, AlertDescription, Button, Input, Label } from "#/shared/components/ui";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type LoginErrors = FormValidationErrors<LoginPayload>;

const initialPayload: LoginPayload = {
  email: "",
  password: "",
};

function LoginPage() {
  const [loginCredential, setLoginCredentials] = useState<LoginPayload>(initialPayload);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const loginCustomer = useAuthStore((state) => state.login);

  function updateField(field: keyof LoginPayload, value: string) {
    setLoginCredentials((currentPayload) => ({ ...currentPayload, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = loginSchema.safeParse(loginCredential);

    if (!validation.success) {
      const errors = getFormValidationErrors(validation.error);
      setErrors(errors);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.login(validation.data);
      const customer = response.data.user;

      if (customer.role !== "customer") {
        await authApi.logout();
        setFormError("This account is not registered as a customer account.");
        return;
      }

      loginCustomer(customer);

      void navigate({ to: "/dashboard" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <section className="bg-secondary text-secondary-foreground relative hidden overflow-hidden lg:block">
        <img
          className="absolute inset-0 size-full object-cover opacity-35"
          src="https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=85"
          alt=""
        />
        <div className="bg-secondary/70 absolute inset-0" />

        <div className="relative flex min-h-screen flex-col justify-between p-10">
          <Link className="flex w-fit items-center gap-3" to="/">
            <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <Film className="size-5" aria-hidden="true" />
            </span>

            <div>
              <p className="text-lg font-semibold">977Cinema</p>
              <p className="text-secondary-foreground/70 text-sm">Customer Booking</p>
            </div>
          </Link>

          <div className="max-w-lg">
            <p className="text-secondary-foreground/70 text-sm font-medium">Your Tickets, Ready</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              Sign In Before Checkout And Keep Every Booking In One Place.
            </h1>
            <p className="text-secondary-foreground/75 mt-5 text-base leading-7">
              Pick up where you left off, confirm seats faster, and access upcoming movie tickets
              from your dashboard.
            </p>

            <div className="text-secondary-foreground/80 mt-8 grid gap-3 text-sm">
              <span className="flex items-center gap-2">
                <Ticket className="text-primary size-4" aria-hidden="true" />
                Save booking history and upcoming tickets.
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="text-primary size-4" aria-hidden="true" />
                Secure checkout with session-based access.
              </span>
            </div>
          </div>

          <p className="text-secondary-foreground/60 text-sm">
            Continue booking movies across 977Cinema partner venues.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <Link className="flex items-center gap-3" to="/">
              <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
                <Film className="size-5" aria-hidden="true" />
              </span>

              <div>
                <p className="text-lg font-semibold">977Cinema</p>
                <p className="text-muted text-sm">Customer Booking</p>
              </div>
            </Link>
          </div>

          <div className="bg-surface rounded-md border p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-primary text-sm font-medium">Welcome Back</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">Sign In To Continue</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Access your bookings, checkout faster, and keep your tickets ready.
              </p>
            </div>

            <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <div className="relative">
                  <Mail
                    className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                    className="pl-9"
                    disabled={isSubmitting}
                    id="email"
                    name="email"
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="Email Address"
                    type="email"
                    value={loginCredential.email}
                  />
                </div>

                {errors.email ? (
                  <p className="text-destructive text-sm" id="email-error">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <button
                    className="text-primary hover:text-primary/80 focus-visible:ring-ring text-sm font-medium outline-none focus-visible:ring-2"
                    type="button"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={Boolean(errors.password)}
                    autoComplete="current-password"
                    className="pr-10 pl-9"
                    disabled={isSubmitting}
                    id="password"
                    name="password"
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={loginCredential.password}
                  />

                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-muted hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {errors.password ? (
                  <p className="text-destructive text-sm" id="password-error">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                  <AlertDescription className="text-destructive mt-0">{formError}</AlertDescription>
                </Alert>
              ) : null}

              <Button className="h-10 w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="text-muted-foreground mt-6 text-center text-sm">
              New To 977Cinema? <span className="text-primary font-medium">Sign Up</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export { LoginPage };
