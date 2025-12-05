// client/src/components/MovieCard.tsx
type Movie = {
  id: number;
  title: string;
  release_year?: number;
  poster_url?: string;
  age_rating?: string;
};

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {movie.poster_url ? (
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No image available</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{movie.title}</h3>
        {movie.release_year && (
          <p className="text-gray-600">{movie.release_year}</p>
        )}
        {movie.age_rating && (
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
            {movie.age_rating}
          </span>
        )}
      </div>
    </div>
  );
}