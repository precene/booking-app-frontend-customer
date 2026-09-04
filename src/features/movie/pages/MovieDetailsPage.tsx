import { Link, useNavigate } from "@tanstack/react-router";
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
import { DateTime } from "luxon";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { DateStrip, showDates } from "#/features/home/components/DateStrip";
import type {
  HomeApiMovie,
  HomeCity,
  HomeShowtime,
  HomeShowtimeSeatMap,
  HomeVenue,
} from "#/features/home/types/homeTypes";
import { Button, DatePicker, Input } from "#/shared/components/ui";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { movieDetailsApi } from "../services/movieDetailsApi";

type MovieDetailsPageProps = {
  movieId: string;
  selectedDateFromSearch?: string;
};

type VenueShowtime = {
  dateLabel: string;
  id: string;
  price: string;
  time: string;
};

type MovieVenue = {
  address: string;
  city: string;
  id: string;
  name: string;
  showtimes: Array<VenueShowtime>;
};

const allowedCityDisplayNames = new Map([
  ["london", "London"],
  ["aldershot", "Aldershot"],
  ["birmingham", "Birmingham"],
  ["kent", "Kent"],
  ["reading", "Reading"],
]);
const allowedCityNames = new Set(allowedCityDisplayNames.keys());

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

function formatShowtimeDateLabel(startsAt: string) {
  const showtimeDate = DateTime.fromISO(startsAt).setZone("Europe/London");
  const today = DateTime.now().setZone("Europe/London").startOf("day");
  const daysFromToday = Math.round(showtimeDate.startOf("day").diff(today, "days").days);

  if (daysFromToday === 0) {
    return "Today";
  }

  if (daysFromToday === 1) {
    return "Tomorrow";
  }

  return showtimeDate.toFormat("cccc");
}

function formatShowtimeTime(startsAt: string) {
  return DateTime.fromISO(startsAt).setZone("Europe/London").toFormat("h:mm a");
}

function formatPriceFromSeatMap(seatMap?: HomeShowtimeSeatMap) {
  const byCategory = seatMap?.byCategory ?? [];
  const seats = seatMap?.seats ?? [];
  const prices = [
    ...byCategory.map((category) => category.priceMinor),
    ...seats.map((seat) => seat.priceMinor),
  ].filter((price) => price > 0);

  if (!prices.length) {
    return "Price TBC";
  }

  return `£${Math.min(...prices) / 100}`;
}

function createVenueGroups({
  cities,
  searchTerm,
  selectedDate,
  seatMapsByShowtimeId,
  showtimes,
  venues,
}: {
  cities: Array<HomeCity>;
  searchTerm: string;
  selectedDate: string;
  seatMapsByShowtimeId: Map<string, HomeShowtimeSeatMap>;
  showtimes: Array<HomeShowtime>;
  venues: Array<HomeVenue>;
}) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const cityNameById = new Map(cities.map((city) => [city.id, city.name]));
  const venueById = new Map(venues.map((venue) => [venue.id, venue]));
  const venueGroups = new Map<string, MovieVenue>();

  const visibleShowtimes = showtimes
    .filter((showtime) => isShowtimeVisibleForDate(showtime, selectedDate))
    .filter((showtime) => {
      const venue = venueById.get(showtime.venue.id);

      if (!venue) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const cityName = cityNameById.get(venue.cityId) ?? "";

      return [venue.name, venue.address, cityName].some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm),
      );
    });

  [...visibleShowtimes]
    .sort((current: HomeShowtime, next: HomeShowtime) =>
      current.startsAt.localeCompare(next.startsAt),
    )
    .forEach((showtime: HomeShowtime) => {
      const venue = venueById.get(showtime.venue.id);

      if (!venue) {
        return;
      }

      const cityName = cityNameById.get(venue.cityId) ?? "UK";
      const venueGroup = venueGroups.get(venue.id) ?? {
        address: venue.address,
        city: cityName,
        id: venue.id,
        name: venue.name,
        showtimes: [],
      };

      venueGroup.showtimes.push({
        dateLabel: formatShowtimeDateLabel(showtime.startsAt),
        id: showtime.id,
        price: formatPriceFromSeatMap(seatMapsByShowtimeId.get(showtime.id)),
        time: formatShowtimeTime(showtime.startsAt),
      });
      venueGroups.set(venue.id, venueGroup);
    });

  return [...venueGroups.values()];
}

function MovieDetailsPage({ movieId, selectedDateFromSearch }: MovieDetailsPageProps) {
  const [movie, setMovie] = useState<HomeApiMovie | null>(null);
  const [cities, setCities] = useState<HomeCity[]>([]);
  const [venues, setVenues] = useState<HomeVenue[]>([]);
  const [showtimes, setShowtimes] = useState<HomeShowtime[]>([]);
  const [seatMapsByShowtimeId, setSeatMapsByShowtimeId] = useState(
    new Map<string, HomeShowtimeSeatMap>(),
  );
  const [selectedDate, setSelectedDate] = useState(
    selectedDateFromSearch ?? showDates[0].toISODate() ?? "",
  );
  const [venueQuery, setVenueQuery] = useState("");
  const [submittedVenueQuery, setSubmittedVenueQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedDateFromSearch && selectedDateFromSearch !== selectedDate) {
      setSelectedDate(selectedDateFromSearch);
    }
  }, [selectedDate, selectedDateFromSearch]);

  useEffect(() => {
    let isMounted = true;

    async function loadMovieShowtimes() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [movieResult, cityResults, venueResults, showtimeResults] = await Promise.all([
          movieDetailsApi.getMovie(movieId),
          movieDetailsApi.listCities(),
          movieDetailsApi.listVenues(),
          movieDetailsApi.listShowtimes({
            date: selectedDate,
            limit: 100,
            movieId,
            page: 1,
          }),
        ]);
        const allowedCities = cityResults
          .filter((city) => allowedCityNames.has(normalizeCityName(city.name)))
          .map((city) => ({ ...city, name: getCityDisplayName(city.name) }));
        const allowedCityIds = new Set(allowedCities.map((city) => city.id));
        const allowedVenues = venueResults.filter((venue) => allowedCityIds.has(venue.cityId));
        const allowedVenueIds = new Set(allowedVenues.map((venue) => venue.id));
        const visibleShowtimes = showtimeResults.items.filter(
          (showtime) =>
            showtime.movie.id === movieId &&
            allowedVenueIds.has(showtime.venue.id) &&
            isShowtimeVisibleForDate(showtime, selectedDate),
        );
        const seatMapEntries = await Promise.all(
          visibleShowtimes.map(async (showtime) => {
            try {
              return [showtime.id, await movieDetailsApi.getShowtimeSeatMap(showtime.id)] as const;
            } catch {
              return [showtime.id, undefined] as const;
            }
          }),
        );

        if (!isMounted) {
          return;
        }

        setMovie(movieResult);
        setCities(allowedCities);
        setVenues(allowedVenues);
        setShowtimes(visibleShowtimes);
        setSeatMapsByShowtimeId(
          new Map(
            seatMapEntries.flatMap(([showtimeId, seatMap]) =>
              seatMap ? [[showtimeId, seatMap]] : [],
            ),
          ),
        );
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load movie showtimes right now."));
          setMovie(null);
          setShowtimes([]);
          setSeatMapsByShowtimeId(new Map());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMovieShowtimes();

    return () => {
      isMounted = false;
    };
  }, [movieId, selectedDate]);

  const filteredVenues = useMemo(
    () =>
      createVenueGroups({
        cities,
        searchTerm: submittedVenueQuery,
        selectedDate,
        seatMapsByShowtimeId,
        showtimes,
        venues,
      }),
    [cities, seatMapsByShowtimeId, selectedDate, showtimes, submittedVenueQuery, venues],
  );
  const selectedDateLabel = DateTime.fromISO(selectedDate).toFormat("cccc, LLLL d");

  function handleVenueSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedVenueQuery(venueQuery);
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    void navigate({
      params: { movieId },
      replace: true,
      resetScroll: false,
      search: { date },
      to: "/movies/$movieId",
    });
  }

  if (!isLoading && !movie) {
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

  const title = movie?.title ?? "Loading Movie";
  const posterUrl =
    movie?.posterUrl ??
    movie?.coverImage ??
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85";
  const coverUrl =
    movie?.coverImage ??
    movie?.posterUrl ??
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=85";
  const genre = movie?.genre ?? "Nepali Movie";
  const rating = movie?.ageRating ?? "PG";
  const duration = movie?.durationMinutes ? `${movie.durationMinutes} Min` : "Duration TBC";
  const lowestPrice = formatPriceFromSeatMap([...seatMapsByShowtimeId.values()][0]);

  return (
    <div className="bg-background">
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden border-b">
        <img className="absolute inset-0 size-full object-cover opacity-25" src={coverUrl} alt="" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,41,55,0.96),rgba(31,41,55,0.82),rgba(31,41,55,0.94))]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[20rem_1fr] lg:px-8 lg:py-12">
          <div className="bg-surface-muted overflow-hidden rounded-md border border-white/15 shadow-2xl">
            <img
              className="aspect-[3/4] size-full object-cover"
              src={posterUrl}
              alt={`${title} poster`}
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
                Now Showing
              </span>
              <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white">
                {filteredVenues.length} Venues
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
              Select a venue and showtime to continue to seat selection and secure payment.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
              <MovieMeta icon={Clapperboard} label={genre} />
              <MovieMeta icon={User} label={rating} />
              <MovieMeta icon={Clock} label={duration} />
              <MovieMeta icon={Ticket} label={lowestPrice} />
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
              Showing available screenings for {selectedDateLabel}. Pick a showtime to move to seat
              selection.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
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

            <form
              className="grid w-full gap-2 sm:grid-cols-[1fr_auto] lg:w-auto"
              onSubmit={handleVenueSearchSubmit}
            >
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

              <Button className="h-11" type="submit">
                <Search aria-hidden="true" />
                Search
              </Button>
            </form>
          </div>
        </div>

        {errorMessage ? (
          <div className="border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-md border px-4 py-3 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5">
          {isLoading ? (
            <div className="bg-surface rounded-md border px-6 py-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold">Loading Showtimes</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Fetching available venues and showtimes for this movie.
              </p>
            </div>
          ) : filteredVenues.length > 0 ? (
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
                Choose another date or search a different venue to view available cinema showtimes.
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
