import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Clock, CreditCard, MapPin, Sofa, Ticket } from "lucide-react";

import { Button } from "#/shared/components/ui";

import { getShowtimeById } from "#/features/movie/utils/movieDetailsData";

type SeatSelectionPageProps = {
  showtimeId: string;
};

const seatHoldDurationMs = 5 * 60 * 1000;
const seats = Array.from({ length: 48 }, (_, index) => `S${index + 1}`);

function SeatSelectionPage({ showtimeId }: SeatSelectionPageProps) {
  const [now, setNow] = useState(Date.now());
  const [seatHolds, setSeatHolds] = useState<Record<string, number>>({});
  const bookingShow = getShowtimeById(showtimeId);
  const selectedSeats = useMemo(
    () =>
      Object.entries(seatHolds)
        .filter(([, expiresAt]) => expiresAt > now)
        .map(([seat]) => seat),
    [now, seatHolds],
  );
  const earliestExpiry = selectedSeats.reduce<number | null>((currentExpiry, seat) => {
    const expiresAt = seatHolds[seat];

    if (!expiresAt) {
      return currentExpiry;
    }

    return currentExpiry === null ? expiresAt : Math.min(currentExpiry, expiresAt);
  }, null);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    setSeatHolds((currentHolds) =>
      Object.fromEntries(
        Object.entries(currentHolds).filter(([, expiresAt]) => expiresAt > Date.now()),
      ),
    );
  }, [now]);

  if (!bookingShow) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-md border px-6 py-14 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Showtime Not Found</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">
            This showtime may no longer be available. Choose another movie showtime to continue.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">
              <ChevronLeft aria-hidden="true" />
              Back To Movies
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const { movie, showtime, venue } = bookingShow;

  function handleSeatToggle(seat: string) {
    setSeatHolds((currentHolds) => {
      if (currentHolds[seat] && currentHolds[seat] > Date.now()) {
        const { [seat]: _removedSeat, ...remainingHolds } = currentHolds;

        return remainingHolds;
      }

      return {
        ...currentHolds,
        [seat]: Date.now() + seatHoldDurationMs,
      };
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button variant="outline" asChild>
        <Link to="/movies/$movieId" params={{ movieId: movie.id }}>
          <ChevronLeft aria-hidden="true" />
          Back To Showtimes
        </Link>
      </Button>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section className="bg-surface rounded-md border p-6 shadow-sm">
          <p className="text-primary text-sm font-medium">Seat Selection</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Choose Your Seats</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Select your seats to hold them for 5 minutes while you complete the booking.
          </p>

          {earliestExpiry ? (
            <div className="bg-primary/10 text-primary border-primary/20 mt-5 flex items-center gap-3 rounded-md border px-4 py-3">
              <Clock className="size-5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Seat Hold Timer</p>
                <p className="text-sm">
                  {formatRemainingTime(earliestExpiry - now)} remaining for selected seats
                </p>
              </div>
            </div>
          ) : null}

          <div className="bg-surface-muted mt-8 rounded-md border p-6">
            <div className="bg-secondary text-secondary-foreground mx-auto max-w-md rounded-md py-3 text-center text-sm font-semibold">
              Screen
            </div>
            <div className="mt-8 grid grid-cols-8 gap-3">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat);
                const expiresAt = seatHolds[seat];

                return (
                  <button
                    aria-pressed={isSelected}
                    className={[
                      "flex aspect-square items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-surface hover:border-primary hover:text-primary",
                    ].join(" ")}
                    key={seat}
                    type="button"
                    onClick={() => handleSeatToggle(seat)}
                  >
                    {isSelected && expiresAt ? (
                      <span className="flex flex-col items-center leading-tight">
                        <span>{seat}</span>
                        <span className="text-[10px] font-medium">
                          {formatRemainingTime(expiresAt - now)}
                        </span>
                      </span>
                    ) : (
                      seat
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside>
          <section className="bg-surface rounded-md border p-6 shadow-sm">
            <p className="text-primary text-sm font-medium">Booking Summary</p>
            <h2 className="mt-2 text-2xl font-semibold">{movie.title}</h2>
            <div className="text-muted-foreground mt-5 grid gap-3 text-sm">
              <span className="flex items-center gap-2">
                <Ticket className="text-primary size-4" aria-hidden="true" />
                {showtime.dateLabel} • {showtime.time}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="text-teal size-4" aria-hidden="true" />
                {venue.name}
              </span>
              <span className="flex items-center gap-2">
                <Sofa className="text-primary size-4" aria-hidden="true" />
                {selectedSeats.length
                  ? `${selectedSeats.length} Seats Selected`
                  : "Select seats to continue"}
              </span>
            </div>
            {selectedSeats.length ? (
              <div className="mt-5 rounded-md border p-3">
                <p className="text-sm font-semibold">Selected Seats</p>
                <p className="text-muted-foreground mt-1 text-sm">{selectedSeats.join(", ")}</p>
              </div>
            ) : null}
            <Button className="mt-6 w-full" disabled={!selectedSeats.length} type="button">
              <CreditCard aria-hidden="true" />
              Continue To Payment
            </Button>
          </section>
        </aside>
      </div>
    </main>
  );
}

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export { SeatSelectionPage };
