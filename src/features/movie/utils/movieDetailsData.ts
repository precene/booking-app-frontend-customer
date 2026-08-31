import { DateTime } from "luxon";

import { movies } from "#/features/home/utils/homeData";

import type { HomeMovie } from "#/features/home/types/homeTypes";

type VenueShowtime = {
  id: string;
  dateLabel: string;
  dateValue: string;
  price: string;
  seatsLeft: number;
  time: string;
};

type MovieVenue = {
  address: string;
  city: string;
  id: string;
  name: string;
  showtimes: Array<VenueShowtime>;
};

const movieVenuesByMovieId: Record<string, Array<MovieVenue>> = {
  "gaun-aayeko-bato": [
    {
      address: "Central London, UK",
      city: "London",
      id: "london-partner-screen",
      name: "977Cinema Partner Screen",
      showtimes: [
        {
          dateLabel: "Today",
          dateValue: getShowDateValue(0),
          id: "gaun-london-1430",
          price: "£14",
          seatsLeft: 32,
          time: "2:30 PM",
        },
        {
          dateLabel: "Today",
          dateValue: getShowDateValue(0),
          id: "gaun-london-1745",
          price: "£14",
          seatsLeft: 18,
          time: "5:45 PM",
        },
        {
          dateLabel: "Today",
          dateValue: getShowDateValue(0),
          id: "gaun-london-2020",
          price: "£16",
          seatsLeft: 9,
          time: "8:20 PM",
        },
      ],
    },
    {
      address: "High Street, Aldershot, UK",
      city: "Aldershot",
      id: "himalaya-community-theatre",
      name: "Himalaya Community Theatre",
      showtimes: [
        {
          dateLabel: "Tomorrow",
          dateValue: getShowDateValue(1),
          id: "gaun-aldershot-1600",
          price: "£13",
          seatsLeft: 41,
          time: "4:00 PM",
        },
        {
          dateLabel: "Tomorrow",
          dateValue: getShowDateValue(1),
          id: "gaun-aldershot-1930",
          price: "£15",
          seatsLeft: 22,
          time: "7:30 PM",
        },
      ],
    },
    {
      address: "Town Centre, Reading, UK",
      city: "Reading",
      id: "reading-nepali-film-hall",
      name: "Reading Nepali Film Hall",
      showtimes: [
        {
          dateLabel: getShowDayLabel(4),
          dateValue: getShowDateValue(4),
          id: "gaun-reading-1300",
          price: "£12",
          seatsLeft: 28,
          time: "1:00 PM",
        },
        {
          dateLabel: getShowDayLabel(4),
          dateValue: getShowDateValue(4),
          id: "gaun-reading-1800",
          price: "£14",
          seatsLeft: 15,
          time: "6:00 PM",
        },
      ],
    },
  ],
};

function getMovieById(movieId: string) {
  return movies.find((movie) => movie.id === movieId) ?? null;
}

function getMovieVenues(movie: HomeMovie | null) {
  if (!movie) {
    return [];
  }

  const configuredVenues = movieVenuesByMovieId[movie.id];

  if (configuredVenues) {
    return configuredVenues;
  }

  return [
    {
      address: `${movie.city}, UK`,
      city: movie.city,
      id: `${movie.id}-${movie.city.toLowerCase()}-venue`,
      name: `${movie.city} Partner Cinema`,
      showtimes: movie.showtimes.map((time, index) => ({
        dateLabel: index === 0 ? "Today" : index === 1 ? "Tomorrow" : getShowDayLabel(index),
        dateValue: getShowDateValue(index),
        id: `${movie.id}-${index + 1}`,
        price: movie.priceFrom,
        seatsLeft: 24 - index * 5,
        time,
      })),
    },
  ];
}

function getShowtimeById(showtimeId: string) {
  for (const movie of movies) {
    const venues = getMovieVenues(movie);

    for (const venue of venues) {
      const showtime = venue.showtimes.find((show) => show.id === showtimeId);

      if (showtime) {
        return { movie, showtime, venue };
      }
    }
  }

  return null;
}

function getShowDateValue(daysFromToday: number) {
  return DateTime.now().plus({ days: daysFromToday }).toISODate() ?? "";
}

function getShowDayLabel(daysFromToday: number) {
  return DateTime.now().plus({ days: daysFromToday }).toFormat("cccc");
}

export { getMovieById, getMovieVenues, getShowtimeById };
export type { MovieVenue, VenueShowtime };
