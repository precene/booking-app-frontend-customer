import type { LucideIcon } from "lucide-react";

export type MovieStatus = "Now Showing" | "Advance Booking";

export type HomeMovie = {
  city: string;
  coverUrl: string;
  durationMinutes: number;
  genre: string;
  id: string;
  language: string;
  rating: string;
  posterUrl: string;
  status: MovieStatus;
  title: string;
  trailerUrl?: null | string;
  venueCount: number;
};

export type HomeCity = {
  active: boolean;
  createdAt: string;
  id: string;
  name: string;
  slug: string;
  timezone: string;
  updatedAt: string;
};

export type HomeVenue = {
  active: boolean;
  address: string;
  cityId: string;
  contactEmail: null | string;
  contactPhone: null | string;
  createdAt: string;
  id: string;
  name: string;
  timezone: string;
  updatedAt: string;
};

export type HomeShowStatus = "cancelled" | "completed" | "live" | "scheduled";

export type HomeShowtime = {
  endsAt: string;
  id: string;
  movie: {
    id: string;
    title: string;
  };
  screen: {
    id: string;
    name: string;
  };
  seatSummary: {
    available: number;
    total: number;
  };
  startsAt: string;
  status: HomeShowStatus;
  venue: {
    id: string;
    name: string;
  };
};

export type HomeShowtimeSeatMap = {
  byCategory: Array<{
    available: number;
    categoryId: null | string;
    categoryName: null | string;
    priceMinor: number;
    total: number;
  }>;
  seats: Array<{
    categoryId: null | string;
    categoryName: null | string;
    id: string;
    priceMinor: number;
    rowLabel: string;
    seatLabel: string;
    status: string;
  }>;
  show: HomeShowtime;
};

export type HomeApiMovie = {
  active: boolean;
  ageRating: null | string;
  cast: Array<string>;
  coverImage: null | string;
  createdAt: string;
  directors: Array<string>;
  durationMinutes: number;
  genre: null | string;
  id: string;
  overview: null | string;
  posterUrl: null | string;
  producers: Array<string>;
  releaseDate: null | string;
  title: string;
  trailerUrl: null | string;
  updatedAt: string;
  writers: Array<string>;
};

export type BookingStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};
