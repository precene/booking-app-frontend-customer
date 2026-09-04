import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeCardElementChangeEvent } from "@stripe/stripe-js";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import type { PaymentMethod } from "../types/settingsTypes";
import { settingsApi } from "../services/settingsApi";
import { useSettingsStore } from "../store/settingsStore";
import { SettingsFormCard } from "./SettingsFormCard";

import { useAuthStore } from "#/features/auth/store/authStore";
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
} from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

function PaymentSettingsForm() {
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [],
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submittingPaymentMethod, setSubmittingPaymentMethod] = useState(false);
  const [removingPaymentMethodId, setRemovingPaymentMethodId] = useState<string | null>(null);

  const paymentMethods = useSettingsStore((state) => state.paymentMethods);
  const setPaymentMethods = useSettingsStore((state) => state.setPaymentMethods);
  const hasSavedPaymentMethod = paymentMethods.length > 0;

  async function submitPayment(paymentMethodId: string) {
    if (paymentMethods.length > 0) {
      toast.destructive({ title: "Only One Payment Method Can Be Saved." });
      return false;
    }

    setSubmittingPaymentMethod(true);
    setStatus(null);

    try {
      const paymentMethod = await settingsApi.addPaymentMethod({
        paymentMethodId,
      });

      setPaymentMethods([paymentMethod]);
      toast.success({ title: "Payment Method Added Successfully." });
      return true;
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to add payment method."));
      return false;
    } finally {
      setSubmittingPaymentMethod(false);
    }
  }

  async function removePaymentMethod(paymentMethodId: string) {
    setRemovingPaymentMethodId(paymentMethodId);
    setStatus(null);

    try {
      await settingsApi.removePaymentMethod(paymentMethodId);
      setPaymentMethods(
        paymentMethods.filter((paymentMethod) => paymentMethod.id !== paymentMethodId),
      );
      toast.success({ title: "Payment Method Removed Successfully." });
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to remove payment method."));
    } finally {
      setRemovingPaymentMethodId(null);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SettingsFormCard
        title="Payment Options"
        description="Manage saved Stripe payment methods for faster movie ticket checkout."
        status={status}
        statusTone="error"
        action={
          hasSavedPaymentMethod ? null : (
            <DialogTrigger asChild>
              <Button type="button">
                <Plus aria-hidden="true" />
                Add Payment
              </Button>
            </DialogTrigger>
          )
        }
      >
        <SavedPaymentMethods
          paymentMethods={paymentMethods}
          removingPaymentMethodId={removingPaymentMethodId}
          onRemovePaymentMethod={removePaymentMethod}
        />
      </SettingsFormCard>

      <DialogContent>
        {!stripePublishableKey || !stripePromise ? (
          <UnavailablePaymentDialog />
        ) : isDialogOpen ? (
          <Elements stripe={stripePromise}>
            <StripePaymentDialog
              isSubmitting={submittingPaymentMethod}
              status={status}
              onSaved={() => setIsDialogOpen(false)}
              onSubmitPayment={submitPayment}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StripePaymentDialog({
  isSubmitting,
  onSaved,
  onSubmitPayment,
  status,
}: {
  isSubmitting: boolean;
  onSaved: () => void;
  onSubmitPayment: (paymentMethodId: string) => Promise<boolean>;
  status: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const customer = useAuthStore((state) => state.customer);

  const [cardError, setCardError] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      setCardError("Stripe card form is not ready yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setCardError("Card details are not ready yet.");
      return;
    }

    if (!isCardComplete) {
      setCardError("Enter complete card details before saving.");
      return;
    }

    const result = await stripe.createPaymentMethod({
      billing_details: {
        email: customer?.email,
        name: customer?.fullName,
        phone: customer?.phone ?? undefined,
      },
      card: cardElement,
      type: "card",
    });

    if (result.error || !result.paymentMethod) {
      setCardError(result.error?.message ?? "Unable to create Stripe payment method.");
      return;
    }

    setCardError(null);
    const isSaved = await onSubmitPayment(result.paymentMethod.id);

    if (isSaved) {
      cardElement.clear();
      setIsCardComplete(false);
      onSaved();
    }
  }

  function handleCardChange(event: StripeCardElementChangeEvent) {
    setIsCardComplete(event.complete);
    setCardError(event.error?.message ?? null);
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogDescription>
          Save a card with Stripe for faster checkout on future Nepali movie bookings.
        </DialogDescription>
      </DialogHeader>

      {cardError || status ? (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertDescription className="mt-0 text-inherit">{cardError ?? status}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="border-input bg-background rounded-md border px-3 py-3 shadow-sm">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  color: "#111827",
                  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                  fontSize: "14px",
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                },
                invalid: {
                  color: "#dc2626",
                },
              },
            }}
            onChange={handleCardChange}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          Card details are collected securely by Stripe. 977Cinema only receives the Stripe payment
          method ID needed to save the card.
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Save Payment Method"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function UnavailablePaymentDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogDescription>
          Stripe card details cannot load until the customer app has a publishable key.
        </DialogDescription>
      </DialogHeader>

      <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
        <AlertDescription className="mt-0 text-inherit">
          Add `VITE_STRIPE_PUBLISHABLE_KEY` to enable Stripe card details.
        </AlertDescription>
      </Alert>
    </>
  );
}

type SavedPaymentMethodsProps = {
  paymentMethods: PaymentMethod[];
  removingPaymentMethodId: string | null;
  onRemovePaymentMethod: (paymentMethodId: string) => Promise<void>;
};

function SavedPaymentMethods({
  onRemovePaymentMethod,
  paymentMethods,
  removingPaymentMethodId,
}: SavedPaymentMethodsProps) {
  return (
    <div className="grid gap-3">
      {paymentMethods.length ? (
        paymentMethods.map((paymentMethod) => (
          <div
            className="bg-background flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
            key={paymentMethod.id}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                <CreditCard className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {formatCardBrand(paymentMethod.cardBrand)} • Ending In {paymentMethod.cardLast4}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Expires {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear}
                  {paymentMethod.isDefault ? " • Default Card" : ""}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={removingPaymentMethodId === paymentMethod.id}
              onClick={() => void onRemovePaymentMethod(paymentMethod.id)}
            >
              <Trash2 aria-hidden="true" />
              {removingPaymentMethodId === paymentMethod.id ? "Removing..." : "Remove"}
            </Button>
          </div>
        ))
      ) : (
        <div className="bg-background rounded-md border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <CreditCard className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">No Saved Card</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Add a Stripe payment method to speed up checkout later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCardBrand(cardBrand: string) {
  return cardBrand
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export { PaymentSettingsForm };
