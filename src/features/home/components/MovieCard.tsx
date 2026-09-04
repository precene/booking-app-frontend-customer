import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Star, Ticket } from "lucide-react";

import { Button } from "#/shared/components/ui";

import type { HomeMovie } from "../types/homeTypes";

type MovieCardProps = {
  movie: HomeMovie;
  selectedDate: string;
};

function MovieCard({ movie, selectedDate }: MovieCardProps) {
  return (
    <article className="group bg-surface overflow-hidden rounded-md border shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="bg-surface-muted relative aspect-[3/4] overflow-hidden">
        <img
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
        />
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold">{movie.title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {movie.genre} • {movie.language}
          </p>
        </div>

        <div className="text-muted-foreground grid gap-2 text-sm">
          <span className="flex items-center gap-2">
            <Clock className="text-primary size-4" aria-hidden="true" />
            {movie.durationMinutes} Min
          </span>
          <span className="flex items-center gap-2">
            <Star className="text-teal size-4" aria-hidden="true" />
            {movie.rating}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="text-teal size-4" aria-hidden="true" />
            {movie.city} • {movie.venueCount} UK Venues
          </span>
        </div>

        <Button className="w-full" asChild>
          <Link
            to="/movies/$movieId"
            params={{ movieId: movie.id }}
            search={{ date: selectedDate }}
          >
            <Ticket aria-hidden="true" />
            View Showtimes
          </Link>
        </Button>
      </div>
    </article>
  );
}

export { MovieCard };
