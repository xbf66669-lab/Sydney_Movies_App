// client/src/components/MovieCard.tsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';

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
  showQuickActions?: boolean;
};

export function MovieCard({ movie, showQuickActions = true }: MovieCardProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading } = useWatchlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const posterUrl = movie.poster_url
    ? movie.poster_url
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null;

  const getTrailerUrl = async (): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );
      const data = await res.json();
      const results = data?.results;
      if (!Array.isArray(results)) return null;
      const trailer = results.find((v: any) => v?.site === 'YouTube' && (v?.type === 'Trailer' || v?.type === 'Teaser'))
        || results.find((v: any) => v?.site === 'YouTube');
      const key = trailer?.key;
      return typeof key === 'string' && key ? `https://www.youtube.com/watch?v=${encodeURIComponent(key)}` : null;
    } catch {
      return null;
    }
  };

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 shadow-lg"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {showQuickActions && (
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen((v) => !v);
              }}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-black/50 hover:bg-black/70 text-white"
              aria-label="Movie quick actions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-white/10 shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    try {
                      if (isInWatchlist(movie.id)) {
                        await removeFromWatchlist(movie.id);
                      } else {
                        await addToWatchlist({
                          id: movie.id,
                          title: movie.title,
                          year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                          rating: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
                          genre: [],
                          image: posterUrl || '',
                        });
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  disabled={loading}
                  className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                >
                  {isInWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    const url = await getTrailerUrl();
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10"
                >
                  View Trailer
                </button>
              </div>
            )}
          </div>
        )}

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