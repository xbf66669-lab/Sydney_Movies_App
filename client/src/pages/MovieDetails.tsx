import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

import { getMovieDetails, getImageUrl } from '../api/tmdb';

const getPosterFallbackDataUrl = (title: string) => {
  const safeTitle = (title || 'No Image').slice(0, 40);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
  <rect width="500" height="750" fill="#111827"/>
  <rect x="24" y="24" width="452" height="702" rx="20" fill="#1f2937"/>
  <text x="250" y="370" text-anchor="middle" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="22">
    <tspan x="250" dy="0">${safeTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>
  </text>
  <text x="250" y="410" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">No poster available</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

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

const getTrailerUrl = (movie: any) => {
  const results = movie?.videos?.results;
  if (!Array.isArray(results)) return null;
  const trailer = results.find((v: any) => v?.site === 'YouTube' && (v?.type === 'Trailer' || v?.type === 'Teaser'))
    || results.find((v: any) => v?.site === 'YouTube');
  const key = trailer?.key;
  return typeof key === 'string' && key ? `https://www.youtube.com/watch?v=${encodeURIComponent(key)}` : null;
};

const handleViewTrailer = (movie: any) => {
  const url = getTrailerUrl(movie);
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteWarning, setNoteWarning] = useState<string | null>(null);
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

  const loadUserWatchlists = async () => {
    if (!user) return;
    setWatchlistsLoading(true);
    try {
      const { data, error: wlErr } = await supabase
        .from('watchlists')
        .select('watchlist_id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (wlErr) throw wlErr;
      setWatchlists((data || []) as Array<{ watchlist_id: number; name: string | null }>);
    } catch (e) {
      console.error('Error loading watchlists:', e);
      setWatchlists([]);
    } finally {
      setWatchlistsLoading(false);
    }
  };

  const toggleWatchlistSelection = (watchlistId: number) => {
    setSelectedWatchlistIds((prev) =>
      prev.includes(watchlistId) ? prev.filter((x) => x !== watchlistId) : [...prev, watchlistId]
    );
  };

  const getNoteStorageKey = (userId: string, movieId: number) => `movie_note:${userId}:${movieId}`;

  const loadNote = async (userId: string, movieId: number) => {
    setNoteError(null);
    setNoteWarning(null);
    try {
      const { data, error: noteErr } = await supabase
        .from('notes')
        .select('body')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .maybeSingle();

      if (noteErr) throw noteErr;
      const body = (data as any)?.body;
      if (typeof body === 'string' && body.trim().length > 0) {
        setNoteDraft(body);
        return;
      }
    } catch (_e) {
      setNoteWarning('Cloud sync unavailable — showing device-local note.');
      // Fallback when table doesn't exist / RLS blocks / etc.
      // keep going to localStorage
    }

    try {
      const raw = localStorage.getItem(getNoteStorageKey(userId, movieId));
      if (typeof raw !== 'string' || !raw) {
        setNoteDraft('');
        return;
      }

      // Backward compat:
      // - older builds stored just the note body as a string
      // - newer builds store JSON: { body, updated_at }
      try {
        const parsed = JSON.parse(raw);
        const body = (parsed as any)?.body;
        setNoteDraft(typeof body === 'string' ? body : '');
      } catch {
        setNoteDraft(raw);
      }
    } catch {
      setNoteDraft('');
    }
  };

  const saveNote = async () => {
    if (!user || !movie) return;
    setNoteSaving(true);
    setNoteSavedMessage(null);
    setNoteError(null);
    setNoteWarning(null);

    const body = noteDraft;
    const updated_at = new Date().toISOString();
    try {
      const { error: upsertErr } = await supabase
        .from('notes')
        .upsert(
          {
            user_id: user.id,
            movie_id: movie.id,
            body,
            updated_at,
          } as any,
          { onConflict: 'user_id,movie_id' } as any
        );

      if (upsertErr) throw upsertErr;

      // Always keep a local copy so notes persist even if reads come from localStorage.
      try {
        localStorage.setItem(
          getNoteStorageKey(user.id, movie.id),
          JSON.stringify({ body, updated_at })
        );
      } catch {
        // ignore localStorage failures
      }

      setNoteSavedMessage('Saved.');
      setTimeout(() => setNoteSavedMessage(null), 1500);
    } catch (e) {
      // Fallback to localStorage so notes still work during development.
      try {
        localStorage.setItem(
          getNoteStorageKey(user.id, movie.id),
          JSON.stringify({ body, updated_at })
        );
        setNoteWarning('Saved locally only — not synced across devices.');
        setNoteSavedMessage('Saved locally.');
        setTimeout(() => setNoteSavedMessage(null), 1500);
      } catch {
        setNoteError('Failed to save note.');
      }
      console.error('Error saving note:', e);
    } finally {
      setNoteSaving(false);
    }
  };

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

  useEffect(() => {
    if (!user || !movie) return;
    if (typeof movie.id !== 'number') return;
    loadNote(user.id, movie.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, movie?.id]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
                  strokeWidth="2"
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
                    e.currentTarget.src = getPosterFallbackDataUrl(movie.title);
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

                          <button
                            type="button"
                            onClick={() => {
                              if (isInWatchlist(movie.id)) {
                                handleRemoveFromWatchlist();
                              } else {
                                handleOpenSelectWatchlists();
                              }
                            }}
                            disabled={watchlistLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold"
                          >
                            {isInWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          </button>
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
                    </div>

                    <div className="flex-shrink-0 relative">
                      <button
                        type="button"
                        onClick={() => setIsActionsMenuOpen((v) => !v)}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Movie actions"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                        </svg>
                      </button>

                      {isActionsMenuOpen && (
                        <div className="absolute right-0 mt-3 w-56 rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden z-20">
                          <button
                            type="button"
                            onClick={() => {
                              setIsActionsMenuOpen(false);
                              if (isInWatchlist(movie.id)) {
                                handleRemoveFromWatchlist();
                              } else {
                                handleOpenSelectWatchlists();
                              }
                            }}
                            disabled={watchlistLoading}
                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                          >
                            {isInWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsActionsMenuOpen(false);
                              handleViewTrailer(movie);
                            }}
                            disabled={!getTrailerUrl(movie)}
                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                          >
                            View Trailer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overview */}
                  <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
                  </div>

                  <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h2 className="text-2xl font-bold text-white">My Notes</h2>
                      <button
                        type="button"
                        onClick={saveNote}
                        disabled={noteSaving}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium"
                      >
                        {noteSaving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                    {noteWarning && <div className="mb-3 text-sm text-amber-300">{noteWarning}</div>}
                    {noteError && <div className="mb-3 text-sm text-red-400">{noteError}</div>}
                    {noteSavedMessage && <div className="mb-3 text-sm text-green-400">{noteSavedMessage}</div>}
                    {!user ? (
                      <div className="text-sm text-gray-300">Sign in to save notes to your profile.</div>
                    ) : null}
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      className="w-full min-h-[140px] px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write anything you want about this movie…"
                    />
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