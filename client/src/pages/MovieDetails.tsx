import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

import { getMovieDetails, getImageUrl } from '../api/tmdb';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-700 mb-6">We're having trouble loading this movie. Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const {
    addToWatchlist,
    addToMultipleWatchlists,
    isInWatchlist,
    removeFromWatchlist,
    loading: watchlistLoading,
  } = useWatchlist();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [watchlists, setWatchlists] = useState<Array<{ watchlist_id: number; name: string | null }>>([]);
  const [watchlistsLoading, setWatchlistsLoading] = useState(false);
  const [isSelectWatchlistsOpen, setIsSelectWatchlistsOpen] = useState(false);
  const [selectedWatchlistIds, setSelectedWatchlistIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await getMovieDetails(id!);

        // Transform the API data to match your expected format
        const formattedMovie = {
          ...data,
          year: new Date(data.release_date).getFullYear(),
          rating: data.vote_average,
          genre: data.genres?.map((g: { id: number; name: string }) => g.name) || [],
          image: getImageUrl(data.poster_path, 'w500'),
          director: data.credits?.crew?.find(
            (person: { job: string }) => person.job === 'Director'
          )?.name || 'Unknown',
          cast: data.credits?.cast?.slice(0, 4).map((person: any) => ({
            name: person.name,
            character: person.character || 'N/A',
            profile_path: person.profile_path,
          })) || [],
          providers: data['watch/providers']?.results?.US || {},
          runtime: data.runtime || 0,
          release_date: data.release_date || '',
          overview: data.overview || 'No overview available.',
        };

        setMovie(formattedMovie);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const loadUserWatchlists = async () => {
    if (!user) return;
    setWatchlistsLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('watchlist_id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWatchlists(data || []);
    } catch (err) {
      console.error('Error loading user watchlists:', err);
      setWatchlists([]);
    } finally {
      setWatchlistsLoading(false);
    }
  };

  const toggleWatchlistSelection = (id: number) => {
    setSelectedWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleOpenSelectWatchlists = async () => {
    if (!movie || !user) return;
    await loadUserWatchlists();
    setSelectedWatchlistIds([]);
    setIsSelectWatchlistsOpen(true);
  };

  const handleConfirmAddToWatchlists = async () => {
    if (!movie) return;

    // If user has no lists yet, fall back to default behavior
    if (watchlists.length === 0 || selectedWatchlistIds.length === 0) {
      try {
        await addToWatchlist({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          genre: movie.genre,
          image: movie.image,
        });
      } catch (error) {
        console.error('Error adding to watchlist:', error);
      } finally {
        setIsSelectWatchlistsOpen(false);
      }
      return;
    }

    try {
      await addToMultipleWatchlists(
        {
          id: movie.id,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          genre: movie.genre,
          image: movie.image,
        },
        selectedWatchlistIds
      );
      setIsSelectWatchlistsOpen(false);
    } catch (error) {
      console.error('Error adding to selected watchlists:', error);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    if (!movie) return;

    try {
      await removeFromWatchlist(movie.id);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  // If there's an error, throw it to the error boundary
  if (error) {
    throw error;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Movie Not Found</h1>
            <p className="text-gray-300 mb-6">The movie you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button with glass effect */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center group"
            >
              <svg
                className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Results
            </button>
          </div>

          {/* Main Movie Card */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="md:flex">
              {/* Movie Poster with Glow Effect */}
              <div className="md:w-1/3 lg:w-1/4 relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-medium text-lg">View Full Size</span>
                </div>
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/500x750?text=${encodeURIComponent(movie.title)}`;
                  }}
                />
              </div>

              {/* Movie Details */}
              <div className="p-8 md:w-2/3 lg:w-3/4">
                <div className="space-y-8">
                  {/* Title and Actions */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-4xl md:text-5xl font-bold text-white">
                            {movie.title}
                          </h1>
                          <span className="text-2xl text-gray-400">({movie.year})</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center bg-yellow-400/20 text-white text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                            <svg
                              className="w-4 h-4 mr-1.5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              />
                            </svg>
                            <span className="text-white">{movie.rating.toFixed(1)}</span>
                          </div>

                          <div className="flex items-center text-gray-300 text-sm">
                            <svg
                              className="w-4 h-4 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatRuntime(movie.runtime)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {movie.genre.map((genre: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white/10 text-white/90 text-xs font-medium rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isInWatchlist(movie.id) ? (
                        <button
                          onClick={handleRemoveFromWatchlist}
                          disabled={watchlistLoading}
                          className="flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium shadow-lg hover:shadow-red-500/30"
                        >
                          {watchlistLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Removing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              In Watchlist
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenSelectWatchlists}
                          disabled={watchlistLoading}
                          className="flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30"
                        >
                          {watchlistLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Adding...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add to Watchlist
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Overview */}
                  <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
                  </div>

                  {/* Where to Watch */}
                  {movie.providers?.flatrate && (
                    <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-6">Where to Watch</h2>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-300 mb-4">Stream</h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {movie.providers.flatrate.map((provider: any) => (
                              <div
                                key={provider.provider_id}
                                className="flex flex-col items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                              >
                                <div className="w-16 h-16 bg-white/5 rounded-full p-2 mb-2 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                  <img
                                    src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiPjwvcmVjdD48Y2lyY2xlIGN4PSI4LjUiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-white/90 text-center">
                                  {provider.provider_name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cast */}
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold text-white mb-6">Top Cast</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {movie.cast.map((person: any, index: number) => (
                          <div key={index} className="group">
                            <div className="w-full aspect-square bg-gray-800 rounded-2xl overflow-hidden mb-3 relative">
                              {person.profile_path ? (
                                <img
                                  src={getImageUrl(person.profile_path, 'w185')}
                                  alt={person.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAwLTQtNEg4YTQgNCAwIDAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg
                                    className="w-12 h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <div>
                                  <h3 className="font-bold text-white">{person.name}</h3>
                                  <p className="text-sm text-gray-300">{person.character}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSelectWatchlistsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add to Watchlist</h2>
            {!user ? (
              <div className="text-sm text-gray-700">
                Please sign in to manage your watchlists.
              </div>
            ) : watchlistsLoading ? (
              <div className="text-sm text-gray-700">Loading your watchlists...</div>
            ) : watchlists.length === 0 ? (
              <div className="text-sm text-gray-700">
                You don't have any watchlists yet. A default watchlist will be created.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {watchlists.map((list) => (
                  <label
                    key={list.watchlist_id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWatchlistIds.includes(list.watchlist_id)}
                      onChange={() => toggleWatchlistSelection(list.watchlist_id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-800">
                      {list.name || 'Untitled Watchlist'}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSelectWatchlistsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={watchlistLoading}
                onClick={handleConfirmAddToWatchlists}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {watchlistLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}