import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";
import type { ApiPaginated } from "#/shared/types";

import type {
  BookingSeatMap,
  CheckoutSessionPayload,
  CheckoutSessionResponse,
  MyBooking,
  MyBookingDetails,
  BookingStatus,
  SeatHoldSession,
} from "../types/bookingTypes";

type ListMyBookingsParams = {
  limit?: number;
  page?: number;
  status?: BookingStatus;
};

export const bookingApi = {
  cancelBooking: async (bookingId: string, options: { skipAuthRedirect?: boolean } = {}) => {
    await apiClient.post<ApiResponse<unknown>>(`/me/bookings/${bookingId}/cancel`, undefined, {
      skipAuthRedirect: options.skipAuthRedirect,
    });
  },

  createCheckoutSession: async (
    payload: CheckoutSessionPayload,
    options: { skipAuthRedirect?: boolean } = {},
  ) => {
    const response = await apiClient.post<ApiResponse<CheckoutSessionResponse>>(
      "/checkout-sessions",
      payload,
      {
        skipAuthRedirect: options.skipAuthRedirect,
      },
    );

    return response.data.data;
  },

  getShow: async (showtimeId: string) => {
    const response = await apiClient.get<ApiResponse<{ show: BookingSeatMap["show"] }>>(
      `/shows/${showtimeId}`,
    );

    return response.data.data.show;
  },

  getSeatMap: async (showtimeId: string) => {
    const response = await apiClient.get<ApiResponse<BookingSeatMap>>(`/shows/${showtimeId}/seats`);

    return {
      ...response.data.data,
      seats: response.data.data.seats ?? [],
    };
  },

  getMyBooking: async (bookingId: string) => {
    const response = await apiClient.get<ApiResponse<{ booking: MyBookingDetails }>>(
      `/me/bookings/${bookingId}`,
    );

    return response.data.data.booking;
  },

  getTicketQrUrl: (ticketId: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const normalizedBaseUrl = baseUrl?.replace(/\/$/, "") ?? "";

    return `${normalizedBaseUrl}/me/tickets/${ticketId}/qr.png`;
  },

  getAnonymousHoldSession: async (showtimeId: string) => {
    const response = await apiClient.get<ApiResponse<SeatHoldSession | null>>(
      "/hold-sessions/anonymous",
      {
        params: { showId: showtimeId },
      },
    );

    return response.data.data;
  },

  getHoldSession: async (showtimeId: string) => {
    const response = await apiClient.get<ApiResponse<SeatHoldSession | null>>("/hold-sessions", {
      params: { showId: showtimeId },
      skipAuthRedirect: true,
    });

    return response.data.data;
  },

  listMyBookings: async (params: ListMyBookingsParams) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<MyBooking>>>("/me/bookings", {
      params,
    });

    return {
      ...response.data.data,
      items: response.data.data.items ?? [],
    };
  },
};
