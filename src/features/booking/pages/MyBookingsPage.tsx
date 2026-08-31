import { CalendarDays, Download, MapPin, Ticket } from "lucide-react";

import { Button } from "#/shared/components/ui";
import { upcomingBookings } from "#/features/customer-dashboard/utils/dashboardData";

function MyBookingsPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-primary text-sm font-medium">My Bookings</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">Your Upcoming Movie Tickets</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          Review confirmed bookings, seats, showtimes, and ticket details before you arrive.
        </p>
      </section>

      <section className="grid gap-4">
        {upcomingBookings.map((booking) => (
          <article
            className="bg-surface overflow-hidden rounded-md border shadow-sm"
            key={booking.id}
          >
            <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">{booking.movie}</h3>
                  <span className="bg-success/10 text-success rounded-md px-2 py-1 text-xs font-medium">
                    {booking.status}
                  </span>
                </div>

                <div className="text-muted-foreground mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <span className="flex items-center gap-2">
                    <MapPin className="text-teal size-4" aria-hidden="true" />
                    {booking.venue}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="text-primary size-4" aria-hidden="true" />
                    {booking.date}, {booking.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <Ticket className="text-warning size-4" aria-hidden="true" />
                    Seats {booking.seats}
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button">
                <Download aria-hidden="true" />
                Download Ticket
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export { MyBookingsPage };
