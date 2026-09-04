import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clapperboard,
  Clock,
  MapPin,
  Play,
  Search,
  Sparkles,
  Star,
  Ticket,
  UsersRound,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button, DatePicker, Input } from "#/shared/components/ui";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { DateStrip, showDates } from "../components/DateStrip";
import { MovieGrid } from "../components/MovieGrid";
import { homeApi } from "../services/homeApi";
import type { HomeApiMovie, HomeCity, HomeShowtime, HomeVenue } from "../types/homeTypes";
import { bookingSteps, cinemaHighlights } from "../utils/homeData";
import { buildMovieVenueInfo, mapMovieToHomeMovie } from "../utils/homeMappers";

const MOVIES_PER_PAGE = 4;
const allowedCityDisplayNames = new Map([
  ["london", "London"],
  ["aldershot", "Aldershot"],
  ["birmingham", "Birmingham"],
  ["kent", "Kent"],
  ["reading", "Reading"],
]);
const allowedCityNames = new Set(allowedCityDisplayNames.keys());
const highlightIcons = [Ticket, UsersRound, CalendarDays];

function normalizeCityName(cityName: string) {
  return cityName.trim().toLowerCase();
}

function getCityDisplayName(cityName: string) {
  return allowedCityDisplayNames.get(normalizeCityName(cityName)) ?? cityName;
}

function isShowtimeVisibleForDate(showtime: HomeShowtime, selectedDate: string) {
  const showtimeDate = DateTime.fromISO(showtime.startsAt).setZone("Europe/London").toISODate();

  return showtime.status === "scheduled" && showtimeDate === selectedDate;
}

function createFallbackMovieFromShowtime(showtime: HomeShowtime): HomeApiMovie {
  return {
    active: true,
    ageRating: null,
    cast: [],
    coverImage: null,
    createdAt: showtime.startsAt,
    directors: [],
    durationMinutes: 0,
    genre: null,
    id: showtime.movie.id,
    overview: null,
    posterUrl: null,
    producers: [],
    releaseDate: null,
    title: showtime.movie.title,
    trailerUrl: null,
    updatedAt: showtime.startsAt,
    writers: [],
  };
}

function HomePage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [cities, setCities] = useState<HomeCity[]>([]);
  const [venues, setVenues] = useState<HomeVenue[]>([]);
  const [movies, setMovies] = useState<HomeApiMovie[]>([]);
  const [moviesByVenueId, setMoviesByVenueId] = useState(new Map<string, HomeApiMovie[]>());
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedDate, setSelectedDate] = useState(showDates[0].toISODate());
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      setIsLoading(true);
      setErrorMessage(null);
      setPage(1);

      try {
        const cityResults = await homeApi.listCities();
        const allowedCities = cityResults
          .filter((city) => allowedCityNames.has(normalizeCityName(city.name)))
          .map((city) => ({ ...city, name: getCityDisplayName(city.name) }));
        const selectedCityRecord = allowedCities.find(
          (city) => normalizeCityName(city.name) === normalizeCityName(selectedCity),
        );
        const allowedCityIds = new Set(allowedCities.map((city) => city.id));
        const searchTerm = submittedQuery.trim();
        const [rawVenueResults, showtimeResults, movieResults, genreResults] = await Promise.all([
          homeApi.listVenues({ cityId: selectedCityRecord?.id }),
          homeApi.listShowtimes({
            date: selectedDate,
            limit: 100,
            page: 1,
          }),
          searchTerm
            ? homeApi.listMovies({ limit: 100, page: 1, q: searchTerm })
            : Promise.resolve({ items: [], limit: 100, page: 1, total: 0 }),
          searchTerm
            ? homeApi.listMovies({ genre: searchTerm, limit: 100, page: 1 })
            : Promise.resolve({ items: [], limit: 100, page: 1, total: 0 }),
        ]);
        const venueResults = rawVenueResults.filter(
          (venue) =>
            allowedCityIds.has(venue.cityId) &&
            (!selectedCityRecord || venue.cityId === selectedCityRecord.id),
        );
        const venueIds = new Set(venueResults.map((venue) => venue.id));
        const showtimesForVisibleVenues = showtimeResults.items.filter(
          (showtime) =>
            venueIds.has(showtime.venue.id) && isShowtimeVisibleForDate(showtime, selectedDate),
        );
        let filteredShowtimes = showtimesForVisibleVenues;

        if (searchTerm) {
          const normalizedSearchTerm = searchTerm.toLowerCase();
          const cityNameById = new Map(allowedCities.map((city) => [city.id, city.name]));
          const venueById = new Map(venueResults.map((venue) => [venue.id, venue]));
          const matchingMovieIds = new Set([
            ...movieResults.items.map((movie) => movie.id),
            ...genreResults.items.map((movie) => movie.id),
          ]);
          const matchingVenues = venueResults.filter((venue) => {
            const cityName = cityNameById.get(venue.cityId) ?? "";

            return [venue.name, venue.address, cityName].some((value) =>
              value.toLowerCase().includes(normalizedSearchTerm),
            );
          });
          const matchingVenueIds = new Set(matchingVenues.map((venue) => venue.id));

          filteredShowtimes = showtimesForVisibleVenues.filter((showtime) => {
            const venue = venueById.get(showtime.venue.id);
            const cityName = venue ? cityNameById.get(venue.cityId) : "";

            return (
              matchingMovieIds.has(showtime.movie.id) ||
              matchingVenueIds.has(showtime.venue.id) ||
              Boolean(cityName?.toLowerCase().includes(normalizedSearchTerm))
            );
          });
        }

        const orderedMovieIds = [
          ...new Set(
            [...filteredShowtimes]
              .sort((current: HomeShowtime, next: HomeShowtime) =>
                current.startsAt.localeCompare(next.startsAt),
              )
              .map((showtime) => showtime.movie.id),
          ),
        ];
        const fallbackMovieById = new Map(
          filteredShowtimes.map((showtime) => [
            showtime.movie.id,
            createFallbackMovieFromShowtime(showtime),
          ]),
        );
        const movieDetailsEntries = await Promise.all(
          orderedMovieIds.map(async (movieId) => {
            try {
              return [movieId, await homeApi.getMovie(movieId)] as const;
            } catch {
              return [movieId, fallbackMovieById.get(movieId)] as const;
            }
          }),
        );
        const movieMap = new Map(
          movieDetailsEntries.flatMap(([movieId, movie]) => (movie ? [[movieId, movie]] : [])),
        );
        const moviesByVenue = new Map<string, Map<string, HomeApiMovie>>();
        filteredShowtimes.forEach((showtime) => {
          const movie = movieMap.get(showtime.movie.id);

          if (!movie) {
            return;
          }

          const venueMovies =
            moviesByVenue.get(showtime.venue.id) ?? new Map<string, HomeApiMovie>();
          venueMovies.set(movie.id, movie);
          moviesByVenue.set(showtime.venue.id, venueMovies);
        });
        const nextMoviesByVenueId = new Map(
          [...moviesByVenue.entries()].map(([venueId, venueMovies]) => [
            venueId,
            [...venueMovies.values()],
          ]),
        );

        if (!isMounted) {
          return;
        }

        setCities(allowedCities);
        setVenues(venueResults);
        setMovies(orderedMovieIds.flatMap((movieId) => movieMap.get(movieId) ?? []));
        setMoviesByVenueId(nextMoviesByVenueId);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load movies right now."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [selectedCity, selectedDate, submittedQuery]);

  useEffect(() => {
    if (selectedCity !== "All Cities" && !cities.some((city) => city.name === selectedCity)) {
      setSelectedCity("All Cities");
    }
  }, [cities, selectedCity]);

  const venueInfoByMovieId = useMemo(
    () => buildMovieVenueInfo(cities, venues, moviesByVenueId),
    [cities, moviesByVenueId, venues],
  );
  const cityFilters = useMemo(() => ["All Cities", ...cities.map((city) => city.name)], [cities]);
  const homeMovies = useMemo(
    () => movies.map((movie) => mapMovieToHomeMovie(movie, venueInfoByMovieId.get(movie.id))),
    [movies, venueInfoByMovieId],
  );
  const filteredMovies = homeMovies;

  const pageCount = Math.max(1, Math.ceil(filteredMovies.length / MOVIES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleMovies = filteredMovies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE,
  );
  const selectedDateLabel = DateTime.fromISO(selectedDate).toFormat("cccc, LLLL d");
  const featuredMovie = filteredMovies[0] ?? homeMovies[0];

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function handleCityChange(value: string) {
    setSelectedCity(value);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  function handleDateChange(value: string) {
    setSelectedDate(value);
    setPage(1);
  }

  return (
    <div className="bg-background">
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden border-b">
        {featuredMovie ? (
          <img
            className="absolute inset-0 size-full object-cover opacity-25"
            src={featuredMovie.coverUrl}
            alt=""
          />
        ) : null}
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

          {featuredMovie ? (
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
                      {featuredMovie.durationMinutes} Min
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="text-teal size-4" aria-hidden="true" />
                      {featuredMovie.city} • {featuredMovie.venueCount} Cinemas And Venues
                    </span>
                  </div>

                  <p className="text-muted-foreground mt-5 text-sm leading-6">
                    Choose this movie to view UK venues, available screening dates, and showtimes.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Button asChild>
                    <Link
                      to="/movies/$movieId"
                      params={{ movieId: featuredMovie.id }}
                      search={{ date: selectedDate }}
                    >
                      <Ticket aria-hidden="true" />
                      Book Tickets
                    </Link>
                  </Button>
                  {featuredMovie.trailerUrl ? (
                    <Button variant="outline" asChild>
                      <a href={featuredMovie.trailerUrl} target="_blank" rel="noreferrer">
                        <Play aria-hidden="true" />
                        Watch Trailer
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" type="button" disabled>
                      <Play aria-hidden="true" />
                      Watch Trailer
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ) : (
            <div className="bg-surface text-foreground flex min-h-96 items-center justify-center rounded-md border border-white/15 p-6 text-center shadow-2xl lg:self-center">
              <div>
                <h2 className="text-2xl font-semibold">Movies Loading</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  We are preparing Nepali movie listings for your city.
                </p>
              </div>
            </div>
          )}
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
            {cityFilters.map((city) => (
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

        <form
          className="bg-surface mt-6 rounded-md border p-3 shadow-sm"
          onSubmit={handleSearchSubmit}
        >
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

            <Button className="h-11" type="submit">
              <Search aria-hidden="true" />
              Search Movies
            </Button>
          </div>
        </form>

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

        {errorMessage ? (
          <div className="border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-md border px-4 py-3 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8">
          {isLoading ? (
            <div className="bg-surface rounded-md border px-6 py-12 text-center">
              <h3 className="text-lg font-semibold">Loading Movies</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Fetching Nepali movies, UK cities, and partner venues.
              </p>
            </div>
          ) : (
            <MovieGrid
              movies={visibleMovies}
              page={currentPage}
              pageCount={pageCount}
              selectedDate={selectedDate}
              onPageChange={setPage}
            />
          )}
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
          <div className="grid gap-4 sm:grid-cols-2">
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

export { HomePage };
