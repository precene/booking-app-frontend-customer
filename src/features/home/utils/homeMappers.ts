import type { HomeApiMovie, HomeCity, HomeMovie, HomeVenue } from "../types/homeTypes";

const fallbackPosterUrl =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85";
const fallbackCoverUrl =
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=85";

type MovieVenueInfo = {
  cityNames: string[];
  venueCount: number;
  venueNames: string[];
};

export function mapMovieToHomeMovie(movie: HomeApiMovie, venueInfo?: MovieVenueInfo): HomeMovie {
  const cityNames = venueInfo?.cityNames ?? [];
  const venueCount = venueInfo?.venueCount ?? 0;

  return {
    city: cityNames.length ? cityNames.join(", ") : "UK",
    coverUrl: movie.coverImage || movie.posterUrl || fallbackCoverUrl,
    durationMinutes: movie.durationMinutes,
    genre: movie.genre || "Nepali Movie",
    id: movie.id,
    language: "Nepali",
    posterUrl: movie.posterUrl || movie.coverImage || fallbackPosterUrl,
    rating: movie.ageRating || "PG",
    status: movie.active ? "Now Showing" : "Advance Booking",
    title: movie.title,
    trailerUrl: movie.trailerUrl,
    venueCount,
  };
}

export function buildMovieVenueInfo(
  cities: HomeCity[],
  venues: HomeVenue[],
  moviesByVenueId: Map<string, HomeApiMovie[]>,
) {
  const cityNameById = new Map(cities.map((city) => [city.id, city.name]));
  const venueInfoByMovieId = new Map<string, { cityNames: Set<string>; venueNames: Set<string> }>();

  venues.forEach((venue) => {
    const venueMovies = moviesByVenueId.get(venue.id) ?? [];
    const cityName = cityNameById.get(venue.cityId);

    venueMovies.forEach((movie) => {
      const currentInfo = venueInfoByMovieId.get(movie.id) ?? {
        cityNames: new Set<string>(),
        venueNames: new Set<string>(),
      };

      if (cityName) {
        currentInfo.cityNames.add(cityName);
      }

      currentInfo.venueNames.add(venue.name);
      venueInfoByMovieId.set(movie.id, currentInfo);
    });
  });

  return new Map(
    [...venueInfoByMovieId.entries()].map(([movieId, info]) => [
      movieId,
      {
        cityNames: [...info.cityNames].sort((a, b) => a.localeCompare(b)),
        venueCount: info.venueNames.size,
        venueNames: [...info.venueNames].sort((a, b) => a.localeCompare(b)),
      },
    ]),
  );
}
