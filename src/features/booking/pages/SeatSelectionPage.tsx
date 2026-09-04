import { Link } from "@tanstack/react-router";
import { Armchair, ChevronLeft, Clock, CreditCard, MapPin, RefreshCcw, Ticket } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

import { useAuthStore } from "#/features/auth/store/authStore";
import { Button } from "#/shared/components/ui";
import { toast } from "#/shared/components/ui/toast";
import { cn } from "#/shared/utils/cn";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { bookingApi } from "../services/bookingApi";
import { deviceTokenApi } from "../services/deviceTokenApi";
import type {
  BookingSeat,
  BookingSeatMap,
  BookingSeatStatus,
  BookingShow,
  CheckoutSessionResponse,
  HoldExpiredPayload,
  SeatHoldSession,
  SeatHoldSuccessPayload,
  SeatMapSnapshotPayload,
  SeatReleaseSuccessPayload,
  SeatSessionPayload,
  SeatStateChangePayload,
  SeatTransferredPayload,
  ShowStatusChangePayload,
  SocketErrorPayload,
} from "../types/bookingTypes";
import { getSocketUrl } from "../utils/bookingSocket";

type SeatSelectionPageProps = {
  showtimeId: string;
};

const seatStatusStyles: Record<BookingSeatStatus, string> = {
  available:
    "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100",
  booked: "border-rose-300 bg-rose-50 text-rose-700",
  cancelled: "border-slate-300 bg-slate-100 text-slate-500",
  held: "border-amber-300 bg-amber-50 text-amber-700",
  unavailable: "border-zinc-300 bg-zinc-100 text-zinc-500",
};

const seatStatusLabels: Record<BookingSeatStatus, string> = {
  available: "Available",
  booked: "Booked",
  cancelled: "Unavailable",
  held: "Held",
  unavailable: "Unavailable",
};
const visibleSeatStatusLegend: Array<BookingSeatStatus> = [
  "available",
  "held",
  "booked",
  "cancelled",
];
const maxSeatsPerHold = 10;
const bookableShowStatuses = ["scheduled", "live"];

const socketEvents = {
  error: "error",
  holdExpired: "hold:expired",
  seatTransferred: "seat:transferred",
  seatBooked: "seat:booked",
  seatCancelled: "seat:cancelled",
  seatHeld: "seat:held",
  seatMapSnapshot: "seat_map:snapshot",
  seatReleased: "seat:released",
  seatsHeld: "seats:held",
  seatsHold: "seats:hold",
  seatsRefresh: "seats:refresh",
  seatsRelease: "seats:release",
  seatsReleased: "seats:released",
  seatsSession: "seats:session",
  showStatusChanged: "show:status_changed",
} as const;

function SeatSelectionPage({ showtimeId }: SeatSelectionPageProps) {
  const [show, setShow] = useState<BookingShow | null>(null);
  const [seats, setSeats] = useState<Array<BookingSeat>>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Array<string>>([]);
  const [heldSeatIds, setHeldSeatIds] = useState<Array<string>>([]);
  const [pendingSeatIds, setPendingSeatIds] = useState<Array<string>>([]);
  const [holdSession, setHoldSession] = useState<SeatHoldSession | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionResponse | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isHoldSyncing, setIsHoldSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const customer = useAuthStore((state) => state.customer);
  const socketRef = useRef<Socket | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat.id)),
    [seats, selectedSeatIds],
  );
  const seatRows = useMemo(() => groupSeatsByRow(seats), [seats]);
  const seatCount = useMemo(() => countSeatsByStatus(seats), [seats]);
  const holdExpiresAt = holdSession?.expiresAt ? new Date(holdSession.expiresAt).getTime() : null;
  const subtotalMinor = selectedSeats.reduce((total, seat) => total + seat.priceMinor, 0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    void loadSeatMap({ initial: true });
  }, [showtimeId]);

  useEffect(() => {
    void restoreHoldSession();
  }, [customer, showtimeId]);

  useEffect(() => {
    setSelectedSeatIds((currentSeatIds) =>
      currentSeatIds.filter((seatId) => {
        const seat = seats.find((item) => item.id === seatId);

        return (
          heldSeatIds.includes(seatId) ||
          pendingSeatIds.includes(seatId) ||
          seat?.status === "available"
        );
      }),
    );
  }, [heldSeatIds, pendingSeatIds, seats]);

  useEffect(() => {
    if (!holdExpiresAt || holdExpiresAt > now) {
      return;
    }

    clearCurrentHold();
    requestFreshSeatState({ immediate: true });
  }, [holdExpiresAt, now]);

  useEffect(() => {
    const refreshIntervalId = window.setInterval(() => {
      requestFreshSeatState();
    }, 60_000);

    return () => window.clearInterval(refreshIntervalId);
  }, [showtimeId]);

  useEffect(() => {
    let socket: Socket | null = null;
    let isCancelled = false;

    async function connectSeatSocket() {
      try {
        const deviceToken = await deviceTokenApi.getDeviceToken();

        if (isCancelled) {
          return;
        }

        void restoreHoldSession();

        socket = io(getSocketUrl(), {
          auth: { deviceToken },
          transports: ["websocket", "polling"],
          withCredentials: true,
        });
        socketRef.current = socket;

        registerSocketHandlers(socket);
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(getSocketErrorMessage(error, "Unable to connect live seat map."));
        }
      }
    }

    function registerSocketHandlers(socket: Socket) {
      socket.on("connect", () => {
        socket.emit("join_show", showtimeId);
        socket.emit(socketEvents.seatsRefresh, { showId: showtimeId });
      });

      socket.on("connect_error", (error) => {
        setErrorMessage(error.message || "Unable to connect live seat map.");
      });

      socket.on(socketEvents.seatMapSnapshot, (payload: SeatMapSnapshotPayload) => {
        if (payload.showId !== showtimeId) {
          return;
        }

        setSeats((currentSeats) => mergeSeatSnapshot(currentSeats, payload.seats ?? []));
      });

      socket.on(socketEvents.seatHeld, (payload: SeatStateChangePayload) => {
        updateSeatFromSocket(payload, "held");
        requestFreshSeatState();
      });

      socket.on(socketEvents.seatReleased, (payload: SeatStateChangePayload) => {
        updateSeatFromSocket(payload, "available");
        requestFreshSeatState();
      });

      socket.on(socketEvents.seatBooked, (payload: SeatStateChangePayload) => {
        updateSeatFromSocket(payload, "booked");
        requestFreshSeatState();
      });

      socket.on(socketEvents.seatCancelled, (payload: SeatStateChangePayload) => {
        updateSeatFromSocket(payload, "cancelled");
        requestFreshSeatState();
      });

      socket.on(socketEvents.showStatusChanged, (payload: ShowStatusChangePayload) => {
        if (payload.showId === showtimeId) {
          setShow((currentShow) =>
            currentShow ? { ...currentShow, status: payload.status } : null,
          );
        }
      });

      socket.on(socketEvents.seatsHeld, (payload: SeatHoldSuccessPayload) => {
        if (payload.showId !== showtimeId) {
          return;
        }

        setIsHoldSyncing(false);
        requestFreshSeatState({ immediate: true });
      });

      socket.on(socketEvents.seatsReleased, (payload: SeatReleaseSuccessPayload) => {
        if (payload.showId !== showtimeId) {
          return;
        }

        setIsHoldSyncing(false);
        setPendingSeatIds([]);
        requestFreshSeatState({ immediate: true });
      });

      socket.on(socketEvents.seatsSession, (payload: SeatSessionPayload) => {
        if (payload.showId !== showtimeId) {
          return;
        }

        applyHoldSession(payload.session);
      });

      socket.on(socketEvents.holdExpired, (payload: HoldExpiredPayload) => {
        if (payload.showId !== showtimeId) {
          return;
        }

        clearCurrentHold(payload.seatIds);
        toast.destructive({
          description: "Your seat hold expired. Please choose your seats again.",
          title: "Seat Hold Expired.",
        });
        requestFreshSeatState({ immediate: true });
      });

      socket.on(socketEvents.seatTransferred, (payload: SeatTransferredPayload) => {
        if (payload.showId !== showtimeId) {
          return;
        }

        requestFreshSeatState({ immediate: true });
      });

      socket.on(socketEvents.error, (payload: SocketErrorPayload) => {
        setIsHoldSyncing(false);
        setPendingSeatIds([]);
        setErrorMessage(getSocketErrorPayloadMessage(payload));
        requestFreshSeatState({ immediate: true });
      });
    }

    void connectSeatSocket();

    return () => {
      isCancelled = true;
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      socket?.emit("leave_show", showtimeId);
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [showtimeId]);

  async function loadSeatMap({ initial = false } = {}) {
    if (initial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setErrorMessage(null);

    try {
      const seatMap = await bookingApi.getSeatMap(showtimeId);
      setShow(seatMap.show);
      setSeats(normalizeSeatMapSeats(seatMap));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load showtime seats."));
      setSeats([]);

      try {
        const show = await bookingApi.getShow(showtimeId);
        setShow(show);
      } catch {
        setShow(null);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function requestFreshSeatState({ immediate = false } = {}) {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const refresh = () => {
      void loadSeatMap();
      void restoreHoldSession();
      socketRef.current?.emit(socketEvents.seatsRefresh, { showId: showtimeId });
    };

    if (immediate) {
      refresh();
      return;
    }

    refreshTimeoutRef.current = window.setTimeout(refresh, 250);
  }

  async function restoreHoldSession() {
    try {
      const session =
        (customer ? await bookingApi.getHoldSession(showtimeId).catch(() => null) : null) ??
        (await bookingApi.getAnonymousHoldSession(showtimeId));

      applyHoldSession(session);
    } catch {
      applyHoldSession(null);
    }
  }

  function applyHoldSession(session: SeatHoldSession | null) {
    if (session && new Date(session.expiresAt).getTime() <= Date.now()) {
      clearCurrentHold(session.seats.map((seat) => seat.id));
      return;
    }

    setHoldSession(session);
    setCheckoutSession(null);

    const sessionSeatIds = session?.seats.map((seat) => seat.id) ?? [];
    setPendingSeatIds([]);
    setHeldSeatIds(sessionSeatIds);
    setSelectedSeatIds(sessionSeatIds);
  }

  function updateSeatFromSocket(payload: SeatStateChangePayload, status: BookingSeatStatus) {
    if (payload.showId !== showtimeId) {
      return;
    }

    setSeats((currentSeats) =>
      currentSeats.map((seat) =>
        seat.id === payload.seatId
          ? {
              ...seat,
              rowLabel: payload.rowLabel,
              seatLabel: payload.seatLabel,
              status,
            }
          : seat,
      ),
    );
  }

  async function handleSeatToggle(seat: BookingSeat) {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isHoldSyncing || (!isSelected && seat.status !== "available")) {
      return;
    }

    if (!isShowBookable(show)) {
      toast.destructive({
        description: "This showtime is not available for seat booking.",
        title: "Show Not Available.",
      });
      return;
    }

    if (!isSelected && selectedSeatIds.length >= maxSeatsPerHold) {
      toast.destructive({
        description: `You can hold up to ${maxSeatsPerHold} seats at a time.`,
        title: "Seat Limit Reached.",
      });
      return;
    }

    const nextSeatIds = isSelected
      ? selectedSeatIds.filter((seatId) => seatId !== seat.id)
      : [...selectedSeatIds, seat.id];

    setErrorMessage(null);
    setCheckoutSession(null);

    const socket = socketRef.current;

    if (!socket?.connected) {
      setErrorMessage("Live seat booking is not connected yet. Please try again in a moment.");
      requestFreshSeatState({ immediate: true });
      return;
    }

    setIsHoldSyncing(true);
    setPendingSeatIds((currentSeatIds) =>
      isSelected
        ? currentSeatIds.filter((seatId) => seatId !== seat.id)
        : [...new Set([...currentSeatIds, seat.id])],
    );
    setSelectedSeatIds(nextSeatIds);

    if (isSelected) {
      socket.emit(socketEvents.seatsRelease, {
        seatIds: [seat.id],
        showId: showtimeId,
      });
      return;
    }

    socket.emit(socketEvents.seatsHold, {
      seatIds: [seat.id],
      showId: showtimeId,
    });
  }

  function clearCurrentHold(expiredSeatIds?: Array<string>) {
    const releasedSeatIds = expiredSeatIds ?? [...new Set([...heldSeatIds, ...selectedSeatIds])];

    if (releasedSeatIds.length) {
      setSeats((currentSeats) =>
        currentSeats.map((seat) =>
          releasedSeatIds.includes(seat.id) && seat.status === "held"
            ? { ...seat, status: "available" }
            : seat,
        ),
      );
    }

    setCheckoutSession(null);
    setHoldSession(null);
    setHeldSeatIds([]);
    setPendingSeatIds([]);
    setSelectedSeatIds([]);
  }

  async function handleContinueToPayment() {
    if (isCheckoutLoading || isHoldSyncing) {
      return;
    }

    if (!isShowBookable(show)) {
      toast.destructive({
        description: "This showtime is not available for payment.",
        title: "Show Not Available.",
      });
      return;
    }

    if (!selectedSeatIds.length) {
      toast.destructive({
        description: "Please choose at least one available seat before continuing.",
        title: "No Seat Selected.",
      });
      return;
    }

    setIsCheckoutLoading(true);
    setErrorMessage(null);

    try {
      if (!holdSession) {
        setErrorMessage("Please wait for your selected seats to be held before continuing.");
        requestFreshSeatState({ immediate: true });
        return;
      }

      if (new Date(holdSession.expiresAt).getTime() <= Date.now()) {
        clearCurrentHold();
        setErrorMessage("Your seat hold expired. Please choose your seats again.");
        requestFreshSeatState({ immediate: true });
        return;
      }

      const heldSessionSeatIds = new Set(holdSession.seats.map((seat) => seat.id));
      const selectedSeatsAreHeld =
        selectedSeatIds.length === holdSession.seats.length &&
        selectedSeatIds.every((seatId) => heldSessionSeatIds.has(seatId));

      if (!selectedSeatsAreHeld) {
        setErrorMessage("Please wait for your selected seats to finish syncing before payment.");
        requestFreshSeatState({ immediate: true });
        return;
      }

      const result =
        checkoutSession ??
        (await bookingApi.createCheckoutSession({
          holdSessionId: holdSession.holdSessionId,
        }));
      setCheckoutSession(result);
      setHeldSeatIds(selectedSeatIds);

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      toast.destructive({
        description:
          "Your seats are held, but the payment page is not available yet. Please try again later.",
        title: "Payment Not Ready.",
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to hold selected seats."));
      requestFreshSeatState({ immediate: true });
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  if (!isLoading && !show) {
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

  const showDateTime = show ? formatShowDateTime(show) : "Loading Showtime";
  const holdRemainingMs = holdExpiresAt ? holdExpiresAt - now : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" asChild>
          {show ? (
            <Link to="/movies/$movieId" params={{ movieId: show.movie.id }}>
              <ChevronLeft aria-hidden="true" />
              Back To Showtimes
            </Link>
          ) : (
            <Link to="/">
              <ChevronLeft aria-hidden="true" />
              Back To Movies
            </Link>
          )}
        </Button>

        <Button
          disabled={isRefreshing}
          onClick={() => loadSeatMap()}
          type="button"
          variant="outline"
        >
          <RefreshCcw aria-hidden="true" />
          Refresh Seats
        </Button>
      </div>

      {errorMessage ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-md border px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section className="bg-surface rounded-md border p-6 shadow-sm">
          <div>
            <div>
              <p className="text-primary text-sm font-medium">Seat Selection</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Choose Your Seats</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Pick available seats for this showtime. Your selection stays active until the seat
                hold expires while you continue to payment.
              </p>
            </div>
          </div>

          {selectedSeats.length && holdRemainingMs > 0 ? (
            <div className="bg-primary/10 text-primary border-primary/20 mt-5 flex items-center gap-3 rounded-md border px-4 py-3">
              <Clock className="size-5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Selection Timer</p>
                <p className="text-sm">
                  {formatRemainingTime(holdRemainingMs)} Remaining To Continue Payment
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {visibleSeatStatusLegend.map((status) => (
              <div className="flex items-center gap-2 text-sm" key={status}>
                <span className={cn("block size-4 rounded border", seatStatusStyles[status])} />
                <span className="text-muted-foreground">
                  {seatStatusLabels[status]} ({seatCount[status]})
                </span>
              </div>
            ))}
          </div>

          <div className="bg-surface-muted mt-8 rounded-md border p-6">
            <div className="bg-secondary text-secondary-foreground mx-auto max-w-md rounded-md py-3 text-center text-sm font-semibold">
              Screen
            </div>

            {isLoading ? (
              <div className="py-16 text-center">
                <h2 className="text-lg font-semibold">Loading Seat Map</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Fetching the latest seats for this showtime.
                </p>
              </div>
            ) : seatRows.length > 0 ? (
              <div className="mt-8 max-w-full overflow-x-auto pb-2">
                <div className="flex w-max min-w-full flex-col gap-3">
                  {seatRows.map((row) => (
                    <div className="flex items-center gap-3" key={row.rowLabel}>
                      <span className="text-muted-foreground w-8 shrink-0 text-sm font-medium">
                        {row.rowLabel}
                      </span>
                      <div className="flex shrink-0 gap-2">
                        {row.seats.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const seatStatusLabel = isSelected
                            ? "Selected"
                            : seatStatusLabels[seat.status];

                          return (
                            <button
                              aria-label={`${seatLabel(seat)} ${seatStatusLabel}`}
                              aria-pressed={isSelected}
                              className={cn(
                                "flex size-10 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed",
                                seatStatusStyles[seat.status],
                                isSelected &&
                                  "border-primary bg-primary text-primary-foreground hover:bg-primary",
                              )}
                              disabled={
                                isHoldSyncing || (!isSelected && seat.status !== "available")
                              }
                              key={seat.id}
                              title={`${seatLabel(seat)} - ${seatStatusLabel}`}
                              type="button"
                              onClick={() => void handleSeatToggle(seat)}
                            >
                              <Armchair className="size-5" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <h2 className="text-lg font-semibold">No Seats Found</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  This showtime does not have a bookable seat map yet.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside>
          <section className="bg-surface rounded-md border p-6 shadow-sm">
            <p className="text-primary text-sm font-medium">Booking Summary</p>
            <h2 className="mt-2 text-2xl font-semibold">{show?.movie.title ?? "Movie"}</h2>
            <div className="text-muted-foreground mt-5 grid gap-3 text-sm">
              <span className="flex items-center gap-2">
                <Ticket className="text-primary size-4" aria-hidden="true" />
                {showDateTime}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="text-teal size-4" aria-hidden="true" />
                {show?.venue.name ?? "Venue"}
              </span>
              <span className="flex items-center gap-2">
                <Armchair className="text-primary size-4" aria-hidden="true" />
                {selectedSeats.length
                  ? `${selectedSeats.length} Seats Selected`
                  : "Select Seats To Continue"}
              </span>
            </div>

            {selectedSeats.length ? (
              <div className="mt-5 rounded-md border p-3">
                <p className="text-sm font-semibold">Selected Seats</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {selectedSeats.map(seatLabel).join(", ")}
                </p>
                <p className="mt-3 text-sm font-semibold">{formatPrice(subtotalMinor)}</p>
              </div>
            ) : null}

            <Button className="mt-6 w-full" type="button" onClick={handleContinueToPayment}>
              <CreditCard aria-hidden="true" />
              {isCheckoutLoading || isHoldSyncing ? "Preparing Payment..." : "Continue To Payment"}
            </Button>
          </section>
        </aside>
      </div>
    </main>
  );
}

function normalizeSeatMapSeats(seatMap: BookingSeatMap) {
  return seatMap.seats.map((seat) => ({
    ...seat,
    categoryColor: seat.categoryColor ?? null,
    categoryId: seat.categoryId ?? null,
    categoryName: seat.categoryName ?? null,
    status: normalizeSeatStatus(seat.status),
  }));
}

function mergeSeatSnapshot(currentSeats: Array<BookingSeat>, snapshotSeats: Array<BookingSeat>) {
  const currentSeatById = new Map(currentSeats.map((seat) => [seat.id, seat]));

  return snapshotSeats.map((snapshotSeat) => {
    const currentSeat = currentSeatById.get(snapshotSeat.id);
    const status = normalizeSeatStatus(snapshotSeat.status);

    return {
      ...snapshotSeat,
      categoryColor: snapshotSeat.categoryColor ?? currentSeat?.categoryColor ?? null,
      categoryId: snapshotSeat.categoryId ?? currentSeat?.categoryId ?? null,
      categoryName: snapshotSeat.categoryName ?? currentSeat?.categoryName ?? null,
      priceMinor: snapshotSeat.priceMinor ?? currentSeat?.priceMinor ?? 0,
      status,
    };
  });
}

function normalizeSeatStatus(status: string): BookingSeatStatus {
  if (["available", "booked", "cancelled", "held", "unavailable"].includes(status)) {
    return status as BookingSeatStatus;
  }

  return "unavailable";
}

function countSeatsByStatus(seats: Array<BookingSeat>) {
  return seats.reduce<Record<BookingSeatStatus, number>>(
    (count, seat) => ({
      ...count,
      [seat.status]: count[seat.status] + 1,
    }),
    {
      available: 0,
      booked: 0,
      cancelled: 0,
      held: 0,
      unavailable: 0,
    },
  );
}

function groupSeatsByRow(seats: Array<BookingSeat>) {
  const rowMap = new Map<string, Array<BookingSeat>>();

  seats.forEach((seat) => {
    rowMap.set(seat.rowLabel, [...(rowMap.get(seat.rowLabel) ?? []), seat]);
  });

  return [...rowMap.entries()].map(([rowLabel, rowSeats]) => ({
    rowLabel,
    seats: [...rowSeats].sort((firstSeat, secondSeat) =>
      firstSeat.seatLabel.localeCompare(secondSeat.seatLabel, undefined, { numeric: true }),
    ),
  }));
}

function isShowBookable(show: BookingShow | null) {
  return show ? bookableShowStatuses.includes(show.status) : false;
}

function seatLabel(seat: BookingSeat) {
  return `${seat.rowLabel}${seat.seatLabel}`;
}

function formatShowDateTime(show: BookingShow) {
  const timezone = show.venue.timezone ?? "Europe/London";

  return DateTime.fromISO(show.startsAt).setZone(timezone).toFormat("cccc, LLL d • h:mm a");
}

function formatPrice(priceMinor: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    style: "currency",
  }).format(priceMinor / 100);
}

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getSocketErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function getSocketErrorPayloadMessage(payload: SocketErrorPayload) {
  if (payload.code === "SEAT_UNAVAILABLE" && payload.seats?.length) {
    return `Seats already taken: ${payload.seats.join(", ")}.`;
  }

  return payload.message || "Unable to update selected seats.";
}

export { SeatSelectionPage };
