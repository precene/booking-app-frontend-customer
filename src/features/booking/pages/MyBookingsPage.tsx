import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  Download,
  Eye,
  Film,
  MapPin,
  RefreshCcw,
  Ticket,
  XCircle,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "#/features/auth/store/authStore";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Pagination,
} from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import type { ApiPaginated } from "#/shared/types";
import { cn } from "#/shared/utils/cn";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { BookingTicketTemplate } from "../components/BookingTicketTemplate";
import { bookingApi } from "../services/bookingApi";
import type {
  BookingShow,
  BookingStatus,
  MyBooking,
  MyBookingDetails,
} from "../types/bookingTypes";

type EnrichedBooking = MyBookingDetails & {
  show: BookingShow | null;
};

const bookingsPerPage = 5;

const initialBookings: ApiPaginated<MyBooking> = {
  items: [],
  limit: bookingsPerPage,
  page: 1,
  total: 0,
};

const statusOptions: Array<{ label: string; value: BookingStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
];

function MyBookingsPage() {
  const [bookings, setBookings] = useState<ApiPaginated<MyBooking>>(initialBookings);
  const [bookingDetails, setBookingDetails] = useState<Array<EnrichedBooking>>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const customer = useAuthStore((state) => state.customer);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(bookings.total / bookings.limit)),
    [bookings.limit, bookings.total],
  );

  useEffect(() => {
    void loadBookings();
  }, [page, status]);

  async function loadBookings() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const bookingResults = await bookingApi.listMyBookings({
        limit: bookingsPerPage,
        page,
        status: status === "all" ? undefined : status,
      });
      setBookings(bookingResults);

      const details = await Promise.all(
        bookingResults.items.map(async (booking) => {
          const detail = await bookingApi.getMyBooking(booking.id);
          const show = await bookingApi.getShow(booking.showId).catch(() => null);

          return { ...detail, show };
        }),
      );
      setBookingDetails(details);
    } catch (error) {
      setBookings(initialBookings);
      setBookingDetails([]);
      setErrorMessage(getApiErrorMessage(error, "Unable to load your bookings."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    setCancellingBookingId(bookingId);
    setErrorMessage(null);

    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success({
        description: "Your pending booking has been cancelled.",
        title: "Booking Cancelled.",
      });
      await loadBookings();
    } catch (error) {
      toast.destructive({
        description: getApiErrorMessage(error, "Unable to cancel this booking."),
        title: "Cancellation Failed.",
      });
    } finally {
      setCancellingBookingId(null);
    }
  }

  function handleStatusChange(nextStatus: BookingStatus | "all") {
    setStatus(nextStatus);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary text-sm font-medium">My Bookings</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">
            Your Movie Tickets And Reservations
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
            Review confirmed bookings, pending reservations, seats, and ticket details before you
            arrive.
          </p>
        </div>

        <Button
          disabled={isLoading}
          onClick={() => void loadBookings()}
          type="button"
          variant="outline"
        >
          <RefreshCcw aria-hidden="true" />
          Refresh
        </Button>
      </section>

      <section className="bg-surface rounded-md border p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              size="sm"
              type="button"
              variant={status === option.value ? "primary" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <BookingListSkeleton />
      ) : bookingDetails.length > 0 ? (
        <section className="grid gap-4">
          {bookingDetails.map((booking) => (
            <BookingCard
              booking={booking}
              customer={customer}
              isCancelling={cancellingBookingId === booking.id}
              key={booking.id}
              onCancel={() => void handleCancelBooking(booking.id)}
            />
          ))}
        </section>
      ) : (
        <section className="bg-surface rounded-md border px-6 py-14 text-center shadow-sm">
          <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-md">
            <Film className="size-7" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">No Bookings Found</h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
            Your bookings will appear here after you reserve seats or complete a ticket purchase.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">
              <Film aria-hidden="true" />
              Browse Movies
            </Link>
          </Button>
        </section>
      )}

      {bookings.total > bookingsPerPage ? (
        <div className="flex justify-end border-t pt-6">
          <Pagination
            isLoading={isLoading}
            onPageChange={setPage}
            page={page}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
}

type BookingCardProps = {
  booking: EnrichedBooking;
  customer: null | {
    email: string;
    fullName: string;
  };
  isCancelling: boolean;
  onCancel: () => void;
};

function BookingCard({ booking, customer, isCancelling, onCancel }: BookingCardProps) {
  const seatLabels = booking.seats.map((seat) => `${seat.rowLabel}${seat.seatLabel}`).join(", ");
  const showDateTime = booking.show
    ? formatShowDateTime(booking.show)
    : "Showtime Details Unavailable";
  const venueName = booking.show?.venue.city?.name
    ? `${booking.show.venue.name}, ${booking.show.venue.city.name}`
    : (booking.show?.venue.name ?? "Venue Details Unavailable");
  const canCancel = booking.status === "pending";

  function handleDownloadTicket() {
    toast.destructive({
      description: "PDF ticket download will be available soon.",
      title: "Download Not Ready.",
    });
  }

  return (
    <article className="bg-surface overflow-hidden rounded-md border shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">
              {booking.show?.movie.title ?? "Movie Booking"}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Booking Ref: {booking.bookingReference}
          </p>

          <div className="text-muted-foreground mt-4 grid gap-2 text-sm md:grid-cols-3">
            <span className="flex items-center gap-2">
              <MapPin className="text-teal size-4" aria-hidden="true" />
              {venueName}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="text-primary size-4" aria-hidden="true" />
              {showDateTime}
            </span>
            <span className="flex items-center gap-2">
              <Ticket className="text-warning size-4" aria-hidden="true" />
              Seats {seatLabels || "Unavailable"}
            </span>
          </div>

          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="text-primary size-4" aria-hidden="true" />
              Booked {formatDate(booking.createdAt)}
            </span>
            {booking.status === "pending" ? (
              <span>Hold Expires {formatDateTime(booking.holdExpiresAt)}</span>
            ) : null}
            <span className="text-foreground font-semibold">
              {formatPrice(booking.totalMinor, booking.currency)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {booking.ticket ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" type="button">
                  <Eye aria-hidden="true" />
                  View Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>View Ticket</DialogTitle>
                  <DialogDescription>
                    Preview your booking ticket and QR code for venue entry.
                  </DialogDescription>
                </DialogHeader>
                <BookingTicketTemplate
                  booking={booking}
                  className="border-0 shadow-none"
                  customer={customer ?? undefined}
                  show={booking.show}
                  ticketId={booking.ticket.id}
                />
              </DialogContent>
            </Dialog>
          ) : null}

          {booking.ticket ? (
            <Button variant="outline" type="button" onClick={handleDownloadTicket}>
              <Download aria-hidden="true" />
              Download Ticket
            </Button>
          ) : null}

          {canCancel ? (
            <Button disabled={isCancelling} onClick={onCancel} type="button" variant="destructive">
              <XCircle aria-hidden="true" />
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BookingListSkeleton() {
  return (
    <section className="grid gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="bg-surface rounded-md border p-5 shadow-sm" key={index}>
          <div className="bg-surface-muted h-5 w-56 rounded" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="bg-surface-muted h-4 rounded" />
            <div className="bg-surface-muted h-4 rounded" />
            <div className="bg-surface-muted h-4 rounded" />
          </div>
        </div>
      ))}
    </section>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
        status === "paid" && "bg-success/10 text-success",
        status === "pending" && "bg-warning/10 text-warning",
        status === "cancelled" && "bg-muted/10 text-muted-foreground",
        status === "expired" && "bg-muted/10 text-muted-foreground",
        status === "failed" && "bg-destructive/10 text-destructive",
        status === "refunded" && "bg-primary/10 text-primary",
      )}
    >
      {toTitleCase(status)}
    </span>
  );
}

function formatShowDateTime(show: BookingShow) {
  const timezone = show.venue.timezone ?? "Europe/London";

  return DateTime.fromISO(show.startsAt).setZone(timezone).toFormat("ccc, LLL d • h:mm a");
}

function formatDate(value: string) {
  return DateTime.fromISO(value).toFormat("LLL d, yyyy");
}

function formatDateTime(value: string) {
  return DateTime.fromISO(value).toFormat("LLL d, yyyy • h:mm a");
}

function formatPrice(priceMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    currency,
    style: "currency",
  }).format(priceMinor / 100);
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export { MyBookingsPage };
