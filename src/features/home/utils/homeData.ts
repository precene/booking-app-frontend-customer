import { CalendarDays, CreditCard, MapPin, Sofa } from "lucide-react";

import type { BookingStep } from "../types/homeTypes";

export const bookingSteps: Array<BookingStep> = [
  {
    title: "Pick Your City",
    description: "Find Nepali film shows in UK cities near your community.",
    icon: MapPin,
  },
  {
    title: "Choose A Show",
    description: "Compare weekend screenings, subtitles, cinema halls, and venues.",
    icon: CalendarDays,
  },
  {
    title: "Select Seats",
    description: "Pick seats together for family, friends, and community nights.",
    icon: Sofa,
  },
  {
    title: "Pay Securely",
    description: "Pay in GBP and keep your cinema tickets in your account.",
    icon: CreditCard,
  },
];

export const cinemaHighlights = [
  {
    title: "Nepali Films In UK Cinemas",
    description: "Discover Nepali movie screenings across UK theatres and community venues.",
  },
  {
    title: "Made For The Diaspora",
    description:
      "Find subtitle-friendly shows, weekend timings, and venues close to Nepali communities.",
  },
  {
    title: "Group-Friendly Booking",
    description: "Plan cinema nights with family and friends without calling the venue.",
  },
];
