import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Clapperboard,
  Clock,
  MapPin,
  Play,
  Search,
  Sparkles,
  Star,
  User,
  Ticket,
  UsersRound,
} from "lucide-react";
import { DateTime } from "luxon";

import { Button, DatePicker, Input } from "#/shared/components/ui";

import { DateStrip, showDates } from "../components/DateStrip";
import { MovieGrid } from "../components/MovieGrid";
import { bookingSteps, cinemaHighlights, featuredMovie, movies } from "../utils/homeData";

const MOVIES_PER_PAGE = 4;
const cities = ["All Cities", "London", "Aldershot", "Reading", "Birmingham", "Manchester"];
const communityStats = [
  { icon: MapPin, label: "UK Cities Covered", value: "5" },
  { icon: Building2, label: "Partner Venues", value: "18" },
  { icon: CalendarCheck, label: "Shows This Week", value: "42" },
];
const highlightIcons = [Ticket, UsersRound, CalendarDays];

function HomePage() {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [selectedDate, setSelectedDate] = useState(showDates[0].toISODate());
  const [page, setPage] = useState(1);

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesSearch =
        !normalizedQuery ||
        [movie.title, movie.genre, movie.language, movie.city].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesCity = selectedCity === "All Cities" || movie.city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [query, selectedCity]);

  const pageCount = Math.max(1, Math.ceil(filteredMovies.length / MOVIES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleMovies = filteredMovies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE,
  );
  const selectedDateLabel = DateTime.fromISO(selectedDate).toFormat("cccc, LLLL d");

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleCityChange(value: string) {
    setSelectedCity(value);
    setPage(1);
  }

  function handleDateChange(value: string) {
    setSelectedDate(value);
    setPage(1);
  }

  return (
    <div className="bg-background">
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden border-b">
        <img
          className="absolute inset-0 size-full object-cover opacity-25"
          src={featuredMovie.coverUrl}
          alt=""
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,41,55,0.96),rgba(31,41,55,0.78),rgba(31,41,55,0.9))]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:min-h-[640px] lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur">
              <Sparkles className="size-4" aria-hidden="true" />
              Nepali Movies In UK Cinemas
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
              Book Nepali Movie Tickets Across The UK.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Find Nepali films screening near your community, compare UK cinemas and venues, and
              reserve seats for family, friends, and weekend movie nights.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button">
                <Ticket aria-hidden="true" />
                Browse Movies
              </Button>
              <Button
                className="border-white/25 bg-white/10 text-white hover:bg-white/15"
                variant="outline"
                type="button"
              >
                <MapPin aria-hidden="true" />
                Find UK Venues
              </Button>
            </div>
          </div>

          <article className="bg-surface text-foreground grid overflow-hidden rounded-md border border-white/15 shadow-2xl sm:grid-cols-[0.8fr_1fr] lg:self-center xl:grid-cols-[0.8fr_1fr]">
            <div className="bg-surface-muted relative min-h-96 overflow-hidden">
              <img
                className="size-full object-cover"
                src={featuredMovie.posterUrl}
                alt={`${featuredMovie.title} featured poster`}
              />
              <span className="bg-primary text-primary-foreground absolute top-4 left-4 rounded-md px-3 py-1 text-sm font-medium shadow-sm">
                Featured
              </span>
            </div>

            <div className="flex flex-col justify-between p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">
                    {featuredMovie.status}
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-semibold">{featuredMovie.title}</h2>
                <div className="text-muted-foreground mt-3 grid gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Clapperboard className="text-primary size-4" aria-hidden="true" />
                    {featuredMovie.genre}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="text-teal size-4" aria-hidden="true" />
                    {featuredMovie.rating}
                  </span>
                </div>

                <div className="text-muted-foreground mt-3 grid gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="text-primary size-4" aria-hidden="true" />
                    {featuredMovie.durationMinutes} Min • Next Show {featuredMovie.nextShowtime}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="text-teal size-4" aria-hidden="true" />
                    {featuredMovie.city} • {featuredMovie.venueCount} Cinemas And Venues
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {featuredMovie.showtimes.map((showtime) => (
                    <Link
                      className="bg-background hover:border-primary hover:text-primary flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors"
                      key={showtime}
                      to="/movies/$movieId"
                      params={{ movieId: featuredMovie.id }}
                    >
                      {showtime}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button asChild>
                  <Link to="/movies/$movieId" params={{ movieId: featuredMovie.id }}>
                    <Ticket aria-hidden="true" />
                    Book Tickets
                  </Link>
                </Button>
                <Button variant="outline" type="button">
                  <Play aria-hidden="true" />
                  Watch Trailer
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="movies">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-primary text-sm font-medium">Now Showing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Nepali Movies Playing Near You
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Browse Nepali movie screenings across UK cinemas and community venues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {cities.map((city) => (
              <button
                className={[
                  "h-9 rounded-md border px-3 text-sm font-medium transition-colors",
                  selectedCity === city
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted",
                ].join(" ")}
                key={city}
                type="button"
                onClick={() => handleCityChange(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface mt-6 rounded-md border p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block" htmlFor="movie-search">
              <Search
                className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="movie-search"
                className="h-11 pl-9"
                placeholder="Search by Nepali movie, genre, venue, or UK city"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
              />
            </label>

            <Button className="h-11" type="button">
              <Search aria-hidden="true" />
              Search Movies
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 overflow-x-auto pb-2">
          <DateStrip selectedDate={selectedDate} onSelectDate={handleDateChange} />
          <DatePicker
            aria-label="Select Movie Date"
            className="border-border hover:bg-surface-muted h-auto min-w-20 flex-col items-center justify-center gap-0 px-3 py-2 text-center shadow-none"
            disablePast
            value={selectedDate}
            onValueChange={handleDateChange}
          >
            <span className="font-medium">Pick</span>
            <span className="text-muted-foreground">Custom Date</span>
          </DatePicker>
        </div>

        <p className="text-muted-foreground mt-4 text-sm">
          Selected Date: <span className="text-foreground font-medium">{selectedDateLabel}</span>
        </p>

        <div className="mt-8">
          <MovieGrid
            movies={visibleMovies}
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </section>

      <section className="bg-surface border-y">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-primary text-sm font-medium">How Booking Works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Reserve Your Cinema Seats In A Few Steps
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Browse available Nepali movies, select a convenient showtime, choose your seats, and
              complete your booking securely.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {bookingSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div className="bg-background rounded-md border p-5" key={step.title}>
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="bg-surface overflow-hidden rounded-md border shadow-sm">
          <img
            className="h-72 w-full object-cover"
            src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85"
            alt="Comfortable cinema seats"
          />
          <div className="p-6">
            <p className="text-primary text-sm font-medium">About 977Cinema</p>
            <h2 className="mt-2 text-3xl font-semibold">Bringing Nepali Cinema Closer To The UK</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              977Cinema helps Nepalese audiences in the UK discover Nepali films, compare local
              venues, choose showtimes, and reserve seats for cinema nights with family and friends.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {communityStats.map((stat) => (
              <StatCard icon={stat.icon} key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {cinemaHighlights.map((highlight, index) => {
              const Icon = highlightIcons[index] ?? Ticket;

              return (
                <article
                  className="bg-surface rounded-md border p-5 shadow-sm"
                  key={highlight.title}
                >
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold">{highlight.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {highlight.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-md border p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div>
          <strong className="block text-4xl leading-none font-bold">{value}</strong>
          <p className="text-muted-foreground mt-2 text-sm font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

export { HomePage };
