import { Link, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuthStore } from "#/features/auth/store/authStore";
import { Alert, AlertDescription, Button } from "#/shared/components/ui";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { settingsApi } from "../services/settingsApi";

type VerificationState = "error" | "loading" | "success";

function VerifyEmailPage() {
  const token = useRouterState({
    select: (state) => (state.location.search as { token?: string }).token,
  });
  const customer = useAuthStore((state) => state.customer);
  const updateCustomer = useAuthStore((state) => state.updateCustomer);
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your new email address...");

  useEffect(() => {
    let isMounted = true;

    async function verifyEmail() {
      if (!token) {
        setVerificationState("error");
        setMessage("Verification token is missing.");
        return;
      }

      setVerificationState("loading");
      setMessage("Verifying your new email address...");

      try {
        const result = await settingsApi.verifyEmailChange({ token });

        if (customer) {
          const profile = await settingsApi.getProfile();

          if (!isMounted) {
            return;
          }

          updateCustomer({
            cityId: profile.cityId,
            cityName: profile.cityName,
            email: profile.email,
            fullName: profile.fullName,
            phone: profile.phone,
            updatedAt: profile.updatedAt,
          });
        }

        if (!isMounted) {
          return;
        }

        setVerificationState("success");
        setMessage(result.message || "Email address updated successfully.");
      } catch (error) {
        if (isMounted) {
          setVerificationState("error");
          setMessage(getApiErrorMessage(error, "Unable to verify your email address."));
        }
      }
    }

    void verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [customer, token, updateCustomer]);

  const isSuccess = verificationState === "success";
  const isError = verificationState === "error";
  const Icon = isSuccess ? CheckCircle2 : verificationState === "error" ? XCircle : MailCheck;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="bg-surface w-full rounded-md border p-6 text-center shadow-sm sm:p-8">
        <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-md">
          <Icon className="size-7" aria-hidden="true" />
        </div>

        <p className="text-primary mt-6 text-sm font-medium">Email Verification</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {isSuccess ? "Email Address Updated" : "Verify Email Address"}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Keep your 977Cinema receipts, booking updates, and ticket notifications connected to the
          right inbox.
        </p>

        <Alert
          className={
            isSuccess
              ? "border-primary/30 bg-primary/5 mt-6 text-left"
              : isError
                ? "border-destructive/30 bg-destructive/5 text-destructive mt-6 text-left"
                : "bg-background mt-6 text-left"
          }
        >
          <AlertDescription className="mt-0 text-inherit">{message}</AlertDescription>
        </Alert>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/settings">Back To Settings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Browse Movies</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

export { VerifyEmailPage };
