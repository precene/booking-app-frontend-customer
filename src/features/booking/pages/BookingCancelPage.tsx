import { Link } from "@tanstack/react-router";
import { Clock, Film, TicketX } from "lucide-react";

import { Button } from "#/shared/components/ui";

function BookingCancelPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="bg-surface w-full rounded-md border p-6 text-center shadow-sm sm:p-10">
        <div className="bg-warning/10 text-warning mx-auto flex size-14 items-center justify-center rounded-full">
          <TicketX className="size-7" aria-hidden="true" />
        </div>

        <p className="text-primary mt-6 text-sm font-medium">Payment Cancelled</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Your Booking Was Not Completed
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-6">
          No payment was taken. If your seats were held before checkout, they may remain reserved
          until the hold timer expires or the backend releases them.
        </p>

        <div className="text-muted-foreground bg-surface-muted mx-auto mt-5 flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <Clock className="text-primary size-4" aria-hidden="true" />
          Seat holds are temporary.
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/">
              <Film aria-hidden="true" />
              Browse Movies
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

export { BookingCancelPage };
