import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Clapperboard,
  Clock,
  MapPin,
  Search,
  Ticket,
  User,
  UsersRound,
} from "lucide-react";

import { Button, DatePicker, Input } from "#/shared/components/ui";

import type { HomeMovie } from "#/features/home/types/homeTypes";
import { DateStrip, showDates } from "#/features/home/components/DateStrip";

import { getMovieVenues } from "../utils/movieDetailsData";

type MovieDetailsPageProps = {
  movie: HomeMovie | null;
};

function MovieDetailsPage({ movie }: MovieDetailsPageProps) {
  const [selectedDate, setSelectedDate] = useState(showDates[0].toISODate() ?? "");
  const [venueQuery, setVenueQuery] = useState("");
  const venues = useMemo(() => getMovieVenues(movie), [movie]);
  const filteredVenues = useMemo(() => {
    const normalizedQuery = venueQuery.trim().toLowerCase();

    return venues
      .map((venue) => ({
        ...venue,
        showtimes: venue.showtimes.filter((showtime) => showtime.dateValue === selectedDate),
      }))
      .filter((venue) => {
        const matchesDate = venue.showtimes.length > 0;
        const matchesSearch =
          !normalizedQuery ||
          [venue.name, venue.city, venue.address].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          );

        return matchesDate && matchesSearch;
      });
  }, [selectedDate, venueQuery, venues]);

  if (!movie) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-md border px-6 py-14 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Movie Not Found</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">
            This movie may no longer be available for booking. Browse the latest Nepali movie
            screenings instead.
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

  return (
    <div className="bg-background">
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden border-b">
        <img
          className="absolute inset-0 size-full object-cover opacity-25"
          src={movie.coverUrl}
          alt=""
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,41,55,0.96),rgba(31,41,55,0.82),rgba(31,41,55,0.94))]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[20rem_1fr] lg:px-8 lg:py-12">
          <div className="bg-surface-muted overflow-hidden rounded-md border border-white/15 shadow-2xl">
            <img
              className="aspect-[3/4] size-full object-cover"
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
            />
          </div>

          <div className="flex flex-col justify-center">
            <Button
              className="w-fit border-white/20 bg-white/10 text-white hover:bg-white/15"
              variant="outline"
              asChild
            >
              <Link to="/">
                <ChevronLeft aria-hidden="true" />
                Back To Movies
              </Link>
            </Button>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm font-medium">
                {movie.status}
              </span>
              <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white">
                {venues.length} Venues
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              {movie.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
              Select a venue and showtime to continue to seat selection and secure payment.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
              <MovieMeta icon={Clapperboard} label={movie.genre} />
              <MovieMeta icon={User} label={movie.rating} />
              <MovieMeta icon={Clock} label={`${movie.durationMinutes} Min`} />
              <MovieMeta icon={Ticket} label={movie.priceFrom} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <div>
            <p className="text-primary text-sm font-medium">Select Showtime</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Choose A Venue And Show Time
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              Each venue shows available times and ticket price. Pick a showtime to move to seat
              selection.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
              <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              <DatePicker
                aria-label="Select Movie Date"
                className="border-border hover:bg-surface-muted h-auto min-w-20 flex-col items-center justify-center gap-0 px-3 py-2 text-center shadow-none"
                disablePast
                value={selectedDate}
                onValueChange={setSelectedDate}
              >
                <span className="font-medium">Pick</span>
                <span className="text-muted-foreground">Custom Date</span>
              </DatePicker>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-[1fr_auto] lg:w-auto">
              <label className="relative block w-full lg:w-80" htmlFor="venue-search">
                <MapPin
                  className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  id="venue-search"
                  className="h-11 pl-9"
                  placeholder="Search venue or city"
                  value={venueQuery}
                  onChange={(event) => setVenueQuery(event.target.value)}
                />
              </label>

              <Button className="h-11" type="button">
                <Search aria-hidden="true" />
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          {filteredVenues.length > 0 ? (
            filteredVenues.map((venue) => (
              <article className="bg-surface rounded-md border p-5 shadow-sm" key={venue.id}>
                <div className="grid gap-5 lg:grid-cols-[18rem_1fr] lg:items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-md">
                      <MapPin className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{venue.name}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{venue.address}</p>
                      <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                        <UsersRound className="text-teal size-4" aria-hidden="true" />
                        {venue.city}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {venue.showtimes.map((showtime) => (
                      <Link
                        className="border-border bg-background hover:border-primary hover:text-primary rounded-md border p-4 transition-colors"
                        key={showtime.id}
                        to="/booking/$showtimeId"
                        params={{ showtimeId: showtime.id }}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="text-primary size-4" aria-hidden="true" />
                            {showtime.time}
                          </span>
                          <span className="text-foreground text-sm font-semibold">
                            {showtime.price}
                          </span>
                        </span>
                        <span className="text-muted-foreground mt-3 block text-sm">
                          {showtime.dateLabel}
                        </span>
                        <span className="text-primary mt-4 inline-flex text-sm font-medium">
                          Select Seats
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="bg-surface rounded-md border px-6 py-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold">No Showtimes Found</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Choose another date to view available cinema showtimes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MovieMeta({ icon: Icon, label }: { icon: typeof Clapperboard; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
      <Icon className="text-primary size-4 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

export { MovieDetailsPage };
