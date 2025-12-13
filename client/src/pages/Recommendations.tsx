// client/src/pages/Recommendations.tsx
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';

type TmdbMovie = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  media_type: 'movie' | 'tv';
};

type MediaType = 'movie' | 'tv';

type SavedPreferences = {
  mediaType: MediaType;
  genreIds: number[];
  yearFrom: number | null;
  yearTo: number | null;
};

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

export default function Recommendations() {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { user } = useAuth();
  const [items, setItems] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = useMemo(() => {
    return user?.id ? `user_preferences:${user.id}` : 'user_preferences:anon';
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = localStorage.getItem(storageKey);

        let prefs: SavedPreferences = {
          mediaType: 'movie',
          genreIds: [],
          yearFrom: null,
          yearTo: null,
        };

        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Backward compat: genre IDs array
            prefs.genreIds = parsed.filter((x) => typeof x === 'number');
          } else if (parsed && typeof parsed === 'object') {
            const maybe = parsed as Partial<SavedPreferences>;
            if (maybe.mediaType === 'movie' || maybe.mediaType === 'tv') prefs.mediaType = maybe.mediaType;
            if (Array.isArray(maybe.genreIds)) prefs.genreIds = maybe.genreIds.filter((x) => typeof x === 'number');
            if (typeof maybe.yearFrom === 'number') prefs.yearFrom = maybe.yearFrom;
            if (typeof maybe.yearTo === 'number') prefs.yearTo = maybe.yearTo;
          }
        } else if (user?.id) {
          // Extra backward compat: older key used by previous builds
          const old = localStorage.getItem(`movie_genre_preferences:${user.id}`);
          if (old) {
            try {
              const parsedOld = JSON.parse(old);
              if (Array.isArray(parsedOld)) {
                prefs.genreIds = parsedOld.filter((x) => typeof x === 'number');
              }
            } catch (_e) {
            }
          }
        }

        const withGenres = prefs.genreIds.length ? `&with_genres=${encodeURIComponent(prefs.genreIds.join(','))}` : '';

        const discoverPath = prefs.mediaType === 'tv' ? 'discover/tv' : 'discover/movie';
        const yearParams = (() => {
          if (prefs.mediaType === 'tv') {
            const from = typeof prefs.yearFrom === 'number' ? `&first_air_date.gte=${prefs.yearFrom}-01-01` : '';
            const to = typeof prefs.yearTo === 'number' ? `&first_air_date.lte=${prefs.yearTo}-12-31` : '';
            return `${from}${to}`;
          }
          const from = typeof prefs.yearFrom === 'number' ? `&primary_release_date.gte=${prefs.yearFrom}-01-01` : '';
          const to = typeof prefs.yearTo === 'number' ? `&primary_release_date.lte=${prefs.yearTo}-12-31` : '';
          return `${from}${to}`;
        })();

        const res = await fetch(
          `https://api.themoviedb.org/3/${discoverPath}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&sort_by=popularity.desc${withGenres}${yearParams}`
        );
        const data = await res.json();

        // Map TV results to the movie-like shape we render below.
        if (prefs.mediaType === 'tv') {
          const tvResults = (data?.results || []) as Array<{
            id: number;
            name: string;
            poster_path?: string | null;
            first_air_date?: string;
            vote_average?: number;
          }>;

          setItems(
            tvResults.map((t) => ({
              id: t.id,
              title: t.name,
              poster_path: t.poster_path,
              release_date: t.first_air_date,
              vote_average: t.vote_average,
              media_type: 'tv',
            }))
          );
        } else {
          setItems(
            ((data?.results || []) as any[]).map((m: any) => ({
              id: m.id,
              title: m.title,
              poster_path: m.poster_path,
              release_date: m.release_date,
              vote_average: m.vote_average,
              genre_ids: m.genre_ids,
              media_type: 'movie',
            }))
          );
        }
      } catch (e) {
        setError('Failed to load recommendations.');
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storageKey]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recommended For You</h1>
      </div>

      {loading ? (
        <div className="text-gray-300">Loading…</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No recommendations yet</h3>
          <p className="mt-1 text-sm text-gray-500">Rate more movies to get personalized recommendations.</p>
          <div className="mt-6">
            <Link
              to="/filters"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Set Preferences
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((movie) => (
            <div key={movie.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="relative pb-[150%] bg-gray-100">
                {movie.media_type === 'movie' ? (
                  <Link to={`/movies/${movie.id}`}>
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : getPosterFallbackDataUrl(movie.title)}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.src = getPosterFallbackDataUrl(movie.title);
                      }}
                    />
                  </Link>
                ) : (
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : getPosterFallbackDataUrl(movie.title)}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getPosterFallbackDataUrl(movie.title);
                    }}
                  />
                )}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {movie.media_type === 'movie' ? (
                        <Link to={`/movies/${movie.id}`} className="hover:text-blue-600 hover:underline">
                          {movie.title}
                        </Link>
                      ) : (
                        <span>{movie.title}</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</p>
                  </div>
                  <div className="flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}
                  </div>
                </div>
                
                {movie.media_type !== 'movie' ? (
                  <button
                    disabled
                    className="mt-3 w-full bg-gray-100 text-gray-500 py-2 rounded-md cursor-not-allowed flex items-center justify-center"
                    title="Series watchlist support not implemented yet"
                  >
                    Series not supported
                  </button>
                ) : isInWatchlist(movie.id) ? (
                  <button
                    disabled
                    className="mt-3 w-full bg-gray-100 text-gray-500 py-2 rounded-md cursor-not-allowed flex items-center justify-center"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    In Watchlist
                  </button>
                ) : (
                  <button
                    onClick={() => addToWatchlist({
                      id: movie.id,
                      title: movie.title,
                      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                      rating: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
                      genre: [],
                      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''
                    })}
                    className="mt-3 w-full bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                      />
                    </svg>
                    Add to Watchlist
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}