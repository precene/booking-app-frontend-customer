export type BookingSeatStatus = "available" | "booked" | "cancelled" | "held" | "unavailable";

export type BookingSeat = {
  categoryColor: null | string;
  categoryId: null | string;
  categoryName: null | string;
  id: string;
  priceMinor: number;
  rowLabel: string;
  seatLabel: string;
  status: BookingSeatStatus;
};

export type BookingShow = {
  endsAt: string;
  id: string;
  movie: {
    durationMinutes?: number;
    id: string;
    title: string;
  };
  screen: {
    id: string;
    name: string;
  };
  startsAt: string;
  status: string;
  venue: {
    city?: {
      id: string;
      name: string;
    };
    id: string;
    name: string;
    timezone?: string;
  };
};

export type BookingSeatMap = {
  seats: Array<BookingSeat>;
  show: BookingShow;
};

export type CheckoutSessionResponse = {
  bookingId: string;
  bookingReference: string;
  holdExpiresAt: string;
  seats: number;
  sessionId?: string;
  url?: null | string;
};

export type CheckoutSessionPayload =
  | {
      holdSessionId: string;
      paymentMethodId?: string;
      promoCodeId?: string;
    }
  | {
      paymentMethodId?: string;
      promoCodeId?: string;
      seatIds: Array<string>;
      showId: string;
    };

export type HoldSessionSeat = {
  id: string;
  priceMinor: number;
  rowLabel: string;
  seatLabel: string;
};

export type SeatHoldSession = {
  expiresAt: string;
  holdSessionId: string;
  seats: Array<HoldSessionSeat>;
};

export type SeatHoldSuccessPayload = {
  expiresAt: string;
  holdSessionId: string;
  seatsHeld: number;
  showId: string;
};

export type SeatReleaseSuccessPayload = {
  seatsReleased: number;
  showId: string;
};

export type SeatSessionPayload = {
  session: SeatHoldSession | null;
  showId: string;
};

export type SeatMapSnapshotPayload = {
  seats: Array<BookingSeat>;
  showId: string;
};

export type SeatStateChangePayload = {
  rowLabel: string;
  seatId: string;
  seatLabel: string;
  showId: string;
  timestamp: string;
  userId: null | string;
};

export type ShowStatusChangePayload = {
  showId: string;
  status: string;
  timestamp: string;
};

export type HoldExpiredPayload = {
  seatIds: Array<string>;
  showId: string;
  timestamp: string;
};

export type SeatTransferredPayload = {
  newUserId: string;
  seatIds: Array<string>;
  showId: string;
  timestamp: string;
};

export type SocketErrorPayload = {
  code?: string;
  message?: string;
  seats?: Array<string>;
};

export type BookingStatus = "pending" | "paid" | "cancelled" | "refunded" | "failed" | "expired";

export type MyBooking = {
  bookingReference: string;
  createdAt: string;
  currency: string;
  holdExpiresAt: string;
  id: string;
  showId: string;
  status: BookingStatus;
  totalMinor: number;
  updatedAt: string;
};

export type MyBookingSeat = {
  id: string;
  priceMinor: number;
  rowLabel: string;
  seatLabel: string;
};

export type MyBookingTicket = {
  id: string;
  issuedAt: string;
  qrCode: string;
};

export type MyBookingDetails = MyBooking & {
  feeMinor: number;
  seats: Array<MyBookingSeat>;
  subtotalMinor: number;
  ticket: MyBookingTicket | null;
};
