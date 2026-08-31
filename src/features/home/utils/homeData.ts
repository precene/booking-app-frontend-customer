import { CalendarDays, CreditCard, MapPin, Sofa } from "lucide-react";

import type { BookingStep, HomeMovie } from "../types/homeTypes";

export const featuredMovie: HomeMovie = {
  id: "gaun-aayeko-bato",
  title: "Gaun Aayeko Bato",
  genre: "Family drama",
  language: "Nepali",
  rating: "PG",
  audienceScore: "94%",
  format: "Nepali With English Subtitles",
  priceFrom: "£14",
  durationMinutes: 106,
  releaseLabel: "Community Pick",
  status: "Now Showing",
  city: "London",
  venueCount: 6,
  nextShowtime: "2:30 PM",
  showtimes: ["2:30 PM", "5:45 PM", "8:20 PM"],
  posterUrl:
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85",
  coverUrl:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=85",
  featured: true,
};

export const movies: Array<HomeMovie> = [
  featuredMovie,
  {
    id: "mahajatra",
    title: "Mahajatra",
    genre: "Comedy drama",
    language: "Nepali",
    rating: "12A",
    audienceScore: "89%",
    format: "Nepali With English Subtitles",
    priceFrom: "£11",
    durationMinutes: 160,
    releaseLabel: "New Release",
    status: "Now Showing",
    city: "Aldershot",
    venueCount: 3,
    nextShowtime: "1:10 PM",
    showtimes: ["1:10 PM", "4:30 PM", "7:40 PM"],
    posterUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "jaari",
    title: "Jaari",
    genre: "Drama",
    language: "Nepali",
    rating: "PG",
    audienceScore: "91%",
    format: "Nepali With English Subtitles",
    priceFrom: "£10",
    durationMinutes: 125,
    releaseLabel: "Popular",
    status: "Now Showing",
    city: "Reading",
    venueCount: 2,
    nextShowtime: "1:45 PM",
    showtimes: ["1:45 PM", "5:00 PM", "8:15 PM"],
    posterUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "dayarani",
    title: "Dayarani",
    genre: "Social drama",
    language: "Nepali",
    rating: "12A",
    audienceScore: "86%",
    format: "Nepali With English Subtitles",
    priceFrom: "£10",
    durationMinutes: 113,
    releaseLabel: "Family Pick",
    status: "Now Showing",
    city: "Birmingham",
    venueCount: 4,
    nextShowtime: "3:20 PM",
    showtimes: ["10:40 AM", "3:20 PM", "6:00 PM"],
    posterUrl:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "purna-bahadur-ko-sarangi",
    title: "Purna Bahadur Ko Sarangi",
    genre: "Romance",
    language: "Nepali",
    rating: "PG",
    audienceScore: "92%",
    format: "Nepali With English Subtitles",
    priceFrom: "£12",
    durationMinutes: 130,
    releaseLabel: "Trending",
    status: "Now Showing",
    city: "London",
    venueCount: 5,
    nextShowtime: "4:05 PM",
    showtimes: ["1:00 PM", "4:05 PM", "7:45 PM"],
    posterUrl:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "rangeli",
    title: "Rangeli",
    genre: "Crime drama",
    language: "Nepali",
    rating: "15",
    audienceScore: "88%",
    format: "Nepali With English Subtitles",
    priceFrom: "£13",
    durationMinutes: 111,
    releaseLabel: "Late Night",
    status: "Now Showing",
    city: "Manchester",
    venueCount: 3,
    nextShowtime: "7:30 PM",
    showtimes: ["5:25 PM", "7:30 PM", "10:10 PM"],
    posterUrl:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "degree-maila",
    title: "Degree Maila",
    genre: "Comedy",
    language: "Nepali",
    rating: "12A",
    audienceScore: "84%",
    format: "Nepali With English Subtitles",
    priceFrom: "£11",
    durationMinutes: 135,
    releaseLabel: "Advance",
    status: "Advance Booking",
    city: "Edinburgh",
    venueCount: 2,
    nextShowtime: "Tomorrow",
    showtimes: ["Tomorrow", "Friday", "Saturday"],
    posterUrl:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "kabaddi-4",
    title: "Kabaddi 4",
    genre: "Romantic comedy",
    language: "Nepali",
    rating: "12A",
    audienceScore: "90%",
    format: "Nepali With English Subtitles",
    priceFrom: "£12",
    durationMinutes: 152,
    releaseLabel: "Weekend Pick",
    status: "Advance Booking",
    city: "London",
    venueCount: 4,
    nextShowtime: "Friday",
    showtimes: ["Friday", "Saturday", "Sunday"],
    posterUrl:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=900&q=85",
    coverUrl:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1600&q=85",
  },
];

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
