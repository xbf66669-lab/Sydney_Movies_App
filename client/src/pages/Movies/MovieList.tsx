// client/src/pages/Movies/MovieList.tsx
import { useQuery } from '@tanstack/react-query';
import { MovieCard } from '../../components/MovieCard';

type MovieListProps = {
  searchQuery: string;
};

export function MovieList({ searchQuery }: MovieListProps) {
  // This is a placeholder - you'll want to replace this with actual data fetching
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies', searchQuery],
    queryFn: async () => {
      // This will be replaced with actual API call
      return [];
    },
  });

  if (isLoading) {
    return <div>Loading movies...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.length > 0 ? (
        movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))
      ) : (
        <p>No movies found. Try adjusting your search.</p>
      )}
    </div>
  );
}