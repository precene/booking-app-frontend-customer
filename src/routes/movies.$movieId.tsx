import { createFileRoute } from "@tanstack/react-router";

import { MovieDetailsPage } from "#/features/movie/pages/MovieDetailsPage";
import { getMovieById } from "#/features/movie/utils/movieDetailsData";

export const Route = createFileRoute("/movies/$movieId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { movieId } = Route.useParams();

  return <MovieDetailsPage movie={getMovieById(movieId)} />;
}
