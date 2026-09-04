import { CalendarDays, MapPin, Ticket, UserRound } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

import { bookingApi } from "../services/bookingApi";
import type { BookingShow, MyBookingDetails } from "../types/bookingTypes";

import { BrandLogo } from "#/shared/components/layout/BrandLogo";
import { cn } from "#/shared/utils/cn";

type BookingTicketCustomer = {
  email?: null | string;
  fullName?: null | string;
};

type BookingTicketTemplateProps = {
  booking: MyBookingDetails;
  className?: string;
  customer?: BookingTicketCustomer;
  show: BookingShow | null;
  ticketId?: null | string;
};

function BookingTicketTemplate({
  booking,
  className,
  customer,
  show,
  ticketId,
}: BookingTicketTemplateProps) {
  const movieTitle = show?.movie.title ?? "Movie Booking";
  const venueName = show?.venue.city?.name
    ? `${show.venue.name}, ${show.venue.city.name}`
    : (show?.venue.name ?? "Venue Details Unavailable");
  const showDateTime = show ? formatShowDateTime(show) : "Showtime Details Unavailable";
  const seatLabels = booking.seats.map((seat) => `${seat.rowLabel}${seat.seatLabel}`).join(", ");
  const customerName = customer?.fullName?.trim() || "977Cinema Customer";

  return (
    <article
      className={cn(
        "bg-surface text-foreground mx-auto w-full max-w-3xl overflow-hidden rounded-md border py-10 shadow-sm",
        className,
      )}
    >
      <div className="bg-secondary text-secondary-foreground grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <BrandLogo imageClassName="h-12 brightness-0 invert" />
          <p className="mt-5 text-sm font-medium text-white/70">Booking Ticket</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">{movieTitle}</h2>
        </div>

        <div className="rounded-md border border-white/15 bg-white/10 px-4 py-3 text-left sm:text-right">
          <p className="text-xs font-medium text-white/60">Booking Ref</p>
          <p className="mt-1 text-lg font-semibold text-white">{booking.bookingReference}</p>
          <p className="mt-2 text-xs font-medium text-white/60">Status</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatBookingStatus(booking.status)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_11rem]">
        <div className="grid gap-5">
          <TicketInfo icon={CalendarDays} label="Showtime" value={showDateTime} />
          <TicketInfo icon={MapPin} label="Venue" value={venueName} />
          <TicketInfo icon={Ticket} label="Seats" value={seatLabels || "Seats Unavailable"} />
          <TicketInfo icon={UserRound} label="Customer" value={customerName} />

          {customer?.email ? (
            <p className="text-muted-foreground border-t pt-4 text-sm">
              Confirmation sent to{" "}
              <span className="text-foreground font-medium">{customer.email}</span>
            </p>
          ) : null}
        </div>

        <div className="grid gap-4">
          <div className="bg-surface-muted flex aspect-square items-center justify-center rounded-md border p-3">
            <TicketQrCode ticketId={ticketId} />
          </div>

          <div className="rounded-md border p-3 text-center">
            <p className="text-muted-foreground text-xs font-medium">Total Paid</p>
            <p className="mt-1 text-xl font-semibold">
              {formatPrice(booking.totalMinor, booking.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-muted border-t px-6 py-4">
        <p className="text-muted-foreground text-xs leading-5">
          Please present this ticket and QR code at the venue entrance. Arrive early enough for seat
          confirmation and venue checks.
        </p>
      </div>
    </article>
  );
}

function TicketQrCode({ ticketId }: { ticketId?: null | string }) {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(ticketId));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!ticketId) {
      setQrImageUrl(null);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const currentTicketId = ticketId;
    let objectUrl: string | null = null;
    let isMounted = true;

    async function loadQrCode() {
      setIsLoading(true);
      setHasError(false);

      try {
        const qrImage = await bookingApi.getTicketQrImage(currentTicketId);
        objectUrl = URL.createObjectURL(qrImage);

        if (isMounted) {
          setQrImageUrl(objectUrl);
        }
      } catch {
        if (isMounted) {
          setQrImageUrl(null);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadQrCode();

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [ticketId]);

  if (isLoading) {
    return <div className="text-muted-foreground text-center text-sm">Loading QR Code...</div>;
  }

  if (qrImageUrl) {
    return <img className="size-full object-contain" src={qrImageUrl} alt="Ticket QR Code" />;
  }

  return (
    <div className="text-muted-foreground text-center text-sm">
      {hasError ? "Unable To Load QR Code" : "QR Code Will Appear Here"}
    </div>
  );
}

function TicketInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
    </div>
  );
}

function formatShowDateTime(show: BookingShow) {
  const timezone = show.venue.timezone ?? "Europe/London";

  return DateTime.fromISO(show.startsAt).setZone(timezone).toFormat("cccc, LLLL d, yyyy • h:mm a");
}

function formatPrice(priceMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    currency,
    style: "currency",
  }).format(priceMinor / 100);
}

function formatBookingStatus(status: MyBookingDetails["status"]) {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export { BookingTicketTemplate };
