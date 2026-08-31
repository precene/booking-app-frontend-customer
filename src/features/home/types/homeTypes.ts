import type { LucideIcon } from "lucide-react";

export type MovieStatus = "Now Showing" | "Advance Booking";

export type HomeMovie = {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: string;
  audienceScore: string;
  format: string;
  priceFrom: string;
  durationMinutes: number;
  releaseLabel: string;
  status: MovieStatus;
  city: string;
  venueCount: number;
  nextShowtime: string;
  showtimes: Array<string>;
  posterUrl: string;
  coverUrl: string;
  featured?: boolean;
};

export type BookingStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};
