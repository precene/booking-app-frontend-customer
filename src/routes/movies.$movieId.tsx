import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "luxon";

import { MovieDetailsPage } from "#/features/movie/pages/MovieDetailsPage";

export const Route = createFileRoute("/movies/$movieId")({
  component: RouteComponent,
  validateSearch: (search): { date?: string } => {
    const date = search.date;

    if (typeof date !== "string") {
      return {};
    }

    const parsedDate = DateTime.fromISO(date);

    if (!parsedDate.isValid || parsedDate.toISODate() !== date) {
      return {};
    }

    return { date };
  },
});

function RouteComponent() {
  const { movieId } = Route.useParams();
  const { date } = Route.useSearch();

  return <MovieDetailsPage movieId={movieId} selectedDateFromSearch={date} />;
}
