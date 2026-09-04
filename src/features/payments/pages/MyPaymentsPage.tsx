import { Link } from "@tanstack/react-router";
import { CalendarDays, CreditCard, Download, Film, RefreshCcw, Ticket } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

import { bookingApi } from "#/features/booking/services/bookingApi";
import type {
  BookingShow,
  MyBooking,
  MyBookingDetails,
} from "#/features/booking/types/bookingTypes";
import { Button, Pagination } from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import { cn } from "#/shared/utils/cn";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type PaymentHistoryItem = MyBookingDetails & {
  show: BookingShow | null;
};

type PaymentStatusFilter = "all" | "paid" | "refunded" | "failed";

const paymentStatuses = ["paid", "refunded", "failed"] as const;
const paymentsPerPage = 8;

const statusOptions: Array<{ label: string; value: PaymentStatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Refunded", value: "refunded" },
  { label: "Failed", value: "failed" },
];

function MyPaymentsPage() {
  const [payments, setPayments] = useState<Array<PaymentHistoryItem>>([]);
  const [status, setStatus] = useState<PaymentStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visiblePayments = useMemo(
    () => payments.slice((page - 1) * paymentsPerPage, page * paymentsPerPage),
    [page, payments],
  );
  const totalPages = Math.max(1, Math.ceil(payments.length / paymentsPerPage));

  useEffect(() => {
    void loadPayments();
  }, [status]);

  async function loadPayments() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const statuses = status === "all" ? paymentStatuses : [status];
      const bookingResults = await Promise.all(
        statuses.map((bookingStatus) =>
          bookingApi.listMyBookings({
            limit: 100,
            page: 1,
            status: bookingStatus,
          }),
        ),
      );
      const bookings = bookingResults.flatMap((result) => result.items);
      const sortedBookings = [...bookings].sort(
        (firstBooking: MyBooking, secondBooking: MyBooking) =>
          new Date(secondBooking.updatedAt).getTime() - new Date(firstBooking.updatedAt).getTime(),
      );

      const details = await Promise.all(
        sortedBookings.map(async (booking) => {
          const detail = await bookingApi.getMyBooking(booking.id);
          const show = await bookingApi.getShow(booking.showId).catch(() => null);

          return { ...detail, show };
        }),
      );

      setPayments(details);
      setPage(1);
    } catch (error) {
      setPayments([]);
      setErrorMessage(getApiErrorMessage(error, "Unable to load your payment history."));
    } finally {
      setIsLoading(false);
    }
  }

  function handleStatusChange(nextStatus: PaymentStatusFilter) {
    setStatus(nextStatus);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary text-sm font-medium">My Payments</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Payment History</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
            See completed payments, failed payment attempts, and refunded ticket bookings.
          </p>
        </div>

        <Button
          disabled={isLoading}
          onClick={() => void loadPayments()}
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

      <section className="bg-surface overflow-hidden rounded-md border shadow-sm">
        <div className="bg-surface-muted text-muted-foreground hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-sm font-medium lg:grid">
          <span>Movie</span>
          <span>Showtime</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Ticket</span>
        </div>

        {isLoading ? (
          <PaymentListSkeleton />
        ) : visiblePayments.length > 0 ? (
          <div className="divide-y">
            {visiblePayments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-md">
              <CreditCard className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">No Payments Found</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
              Your payment history will appear here after you complete a booking checkout.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/">
                <Film aria-hidden="true" />
                Browse Movies
              </Link>
            </Button>
          </div>
        )}
      </section>

      {payments.length > paymentsPerPage ? (
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

function PaymentRow({ payment }: { payment: PaymentHistoryItem }) {
  const movieTitle = payment.show?.movie.title ?? "Movie Booking";
  const showDateTime = payment.show ? formatShowDateTime(payment.show) : "Showtime Unavailable";
  const venueName = payment.show?.venue.city?.name
    ? `${payment.show.venue.name}, ${payment.show.venue.city.name}`
    : (payment.show?.venue.name ?? "Venue Unavailable");

  function handleDownloadReceipt() {
    toast.destructive({
      description: "PDF receipt download will be available soon.",
      title: "Download Not Ready.",
    });
  }

  return (
    <article className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-center">
      <div>
        <p className="font-semibold">{movieTitle}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Booking Ref: {payment.bookingReference}
        </p>
        <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm lg:hidden">
          <Ticket className="text-warning size-4" aria-hidden="true" />
          {venueName}
        </p>
      </div>

      <div className="text-muted-foreground text-sm">
        <p className="flex items-center gap-2">
          <CalendarDays className="text-primary size-4" aria-hidden="true" />
          {showDateTime}
        </p>
        <p className="mt-1 hidden lg:block">{venueName}</p>
      </div>

      <p className="flex items-center gap-2 font-semibold">
        <CreditCard className="text-primary size-4" aria-hidden="true" />
        {formatPrice(payment.totalMinor, payment.currency)}
      </p>

      <StatusBadge status={payment.status} />

      <Button variant="outline" size="sm" type="button" onClick={handleDownloadReceipt}>
        <Download aria-hidden="true" />
        Download Receipt
      </Button>
    </article>
  );
}

function PaymentListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" key={index}>
          <div className="space-y-2">
            <div className="bg-surface-muted h-4 w-48 rounded" />
            <div className="bg-surface-muted h-3 w-36 rounded" />
          </div>
          <div className="bg-surface-muted h-4 rounded" />
          <div className="bg-surface-muted h-4 rounded" />
          <div className="bg-surface-muted h-4 rounded" />
          <div className="bg-surface-muted h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentHistoryItem["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold",
        status === "paid" && "bg-success/10 text-success",
        status === "refunded" && "bg-primary/10 text-primary",
        status === "failed" && "bg-destructive/10 text-destructive",
      )}
    >
      {status === "paid" ? "Paid" : status === "refunded" ? "Refunded" : "Failed"}
    </span>
  );
}

function formatShowDateTime(show: BookingShow) {
  const timezone = show.venue.timezone ?? "Europe/London";

  return DateTime.fromISO(show.startsAt).setZone(timezone).toFormat("ccc, LLL d • h:mm a");
}

function formatPrice(priceMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    currency,
    style: "currency",
  }).format(priceMinor / 100);
}

export { MyPaymentsPage };
