// client/src/components/MovieCard.tsx
import { Link } from 'react-router-dom';

const getPosterFallbackDataUrl = (title: string) => {
  const safeTitle = (title || 'No Image').slice(0, 40);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="#111827"/>
  <rect x="16" y="16" width="268" height="418" rx="16" fill="#1f2937"/>
  <text x="150" y="225" text-anchor="middle" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="16">
    <tspan x="150" dy="0">${safeTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>
  </text>
  <text x="150" y="255" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">No poster available</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

type Movie = {
  id: number;
  title: string;
  poster_path?: string | null;
  poster_url?: string;
  vote_average?: number;
  release_date?: string;
  overview?: string;
};

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_url
    ? movie.poster_url
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null;

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 shadow-lg"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = getPosterFallbackDataUrl(movie.title);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <span className="text-gray-300 text-sm">No image available</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {typeof movie.vote_average === 'number' && movie.vote_average > 0 && (
            <div className="flex items-center mb-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm font-medium text-white">{movie.vote_average.toFixed(1)}/10</span>
            </div>
          )}
          {movie.overview && (
            <p className="text-xs text-gray-200 line-clamp-3">{movie.overview}</p>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{movie.title}</h3>
        {movie.release_date && (
          <p className="text-sm text-gray-300 mt-1">{new Date(movie.release_date).getFullYear()}</p>
        )}
      </div>
    </Link>
  );
}