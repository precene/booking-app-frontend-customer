import { Pagination } from "#/shared/components/ui";

import { MovieCard } from "./MovieCard";
import type { HomeMovie } from "../types/homeTypes";

type MovieGridProps = {
  movies: Array<HomeMovie>;
  page: number;
  pageCount: number;
  selectedDate: string;
  onPageChange: (page: number) => void;
};

function MovieGrid({ movies, onPageChange, page, pageCount, selectedDate }: MovieGridProps) {
  return (
    <div className="space-y-8">
      {movies.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} selectedDate={selectedDate} />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-md border px-6 py-12 text-center">
          <h3 className="text-lg font-semibold">No Movies Found</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Try a different movie title, city, genre, or date.
          </p>
        </div>
      )}

      <div className="flex justify-end border-t pt-6">
        <Pagination
          className="justify-center"
          onPageChange={onPageChange}
          page={page}
          totalPages={pageCount}
        />
      </div>
    </div>
  );
}

export { MovieGrid };
