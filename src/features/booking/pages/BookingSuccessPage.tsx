import { Link, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, Film, Ticket } from "lucide-react";

import { Button } from "#/shared/components/ui";

function BookingSuccessPage() {
  const sessionId = useRouterState({
    select: (state) => (state.location.search as { session_id?: string }).session_id,
  });

  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="bg-surface w-full rounded-md border p-6 text-center shadow-sm sm:p-10">
        <div className="bg-success/10 text-success mx-auto flex size-14 items-center justify-center rounded-full">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>

        <p className="text-primary mt-6 text-sm font-medium">Payment Completed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Your Booking Is Confirmed</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-6">
          Thank you for booking with 977Cinema. Your ticket will be available from My Bookings once
          the payment confirmation is fully processed.
        </p>

        {sessionId ? (
          <p className="bg-surface-muted text-muted-foreground mx-auto mt-5 w-fit rounded-md border px-3 py-2 text-xs">
            Stripe Session: {sessionId}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/my-bookings">
              <Ticket aria-hidden="true" />
              View My Bookings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Film aria-hidden="true" />
              Browse More Movies
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

export { BookingSuccessPage };
