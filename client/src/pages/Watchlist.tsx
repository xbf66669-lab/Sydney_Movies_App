// client/src/pages/Watchlist.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getMovieDetails, getImageUrl } from '../api/tmdb';

type WatchlistRow = {
  watchlist_id: number;
  name: string | null;
  description: string | null;
  created_at: string;
};

type Movie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  image: string | null;
  addedDate: string;
};

export default function Watchlist() {
  const { user } = useAuth();

  const [watchlists, setWatchlists] = useState<WatchlistRow[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistRow | null>(
    null
  );
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingWatchlists, setLoadingWatchlists] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (!user) {
      setWatchlists([]);
      setSelectedWatchlist(null);
      setMovies([]);
      setLoadingWatchlists(false);
      return;
    }

    const fetchWatchlists = async () => {
      setLoadingWatchlists(true);
      try {
        const { data, error } = await supabase
          .from('watchlists')
          .select('watchlist_id, name, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setWatchlists(data || []);

        if (data && data.length > 0) {
          setSelectedWatchlist(data[0]);
          await fetchMoviesForWatchlist(data[0]);
        } else {
          setSelectedWatchlist(null);
          setMovies([]);
        }
      } catch (err) {
        console.error('Error fetching watchlists:', err);
      } finally {
        setLoadingWatchlists(false);
      }
    };

    fetchWatchlists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMoviesForWatchlist = async (watchlist: WatchlistRow) => {
    if (!user) return;

    setLoadingMovies(true);
    try {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('movie_id, added_at')
        .eq('watchlist_id', watchlist.watchlist_id);

      if (error) throw error;

      const hydrated: Movie[] = data
        ? (
            await Promise.all(
              data.map(async (item: any) => {
                try {
                  const details = await getMovieDetails(String(item.movie_id));
                  if (!details) return null;

                  const posterUrl = details
                    ? getImageUrl(details.poster_path, 'w500')
                    : null;

                  return {
                    id: details.id,
                    title: details.title,
                    year: details.release_date
                      ? new Date(details.release_date).getFullYear()
                      : 0,
                    rating: details.vote_average,
                    genre:
                      details.genres?.map((g: { id: number; name: string }) => g.name) ||
                      [],
                    image: posterUrl || null,
                    addedDate: item.added_at
                      ? new Date(item.added_at).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0],
                  } as Movie;
                } catch (err) {
                  console.error('Error hydrating movie from TMDb:', err);
                  return null;
                }
              })
            )
          ).filter((m): m is Movie => m !== null)
        : [];
      setMovies(hydrated);
    } catch (err) {
      console.error('Error fetching movies for watchlist:', err);
      setMovies([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleSelectWatchlist = async (watchlist: WatchlistRow) => {
    setSelectedWatchlist(watchlist);
    await fetchMoviesForWatchlist(watchlist);
  };

  const handleCreateWatchlist = async () => {
    if (!user) return;
    const name = newName.trim() || 'My Watchlist';

    try {
      setCreating(true);

      const { data, error } = await supabase
        .from('watchlists')
        .insert([
          {
            user_id: user.id,
            name,
            description: newDescription.trim() || null,
          },
        ])

        .select('watchlist_id, name, description, created_at')
        .single();

      if (error) throw error;

      const created = data as WatchlistRow;
      setWatchlists(prev => [...prev, created]);
      setNewName('');
      setNewDescription('');
      setIsCreateModalOpen(false);
      await handleSelectWatchlist(created);
    } catch (err) {
      console.error('Error creating watchlist:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveMovie = async (movieId: number) => {
    if (!user || !selectedWatchlist) return;

    try {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('watchlist_id', selectedWatchlist.watchlist_id)
        .eq('movie_id', movieId);

      if (error) throw error;

      setMovies(prev => prev.filter(movie => movie.id !== movieId));
    } catch (err) {
      console.error('Error removing movie from watchlist:', err);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!user) return;
    setIsDeleteModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">
          Please sign in to view your watchlists.
        </div>
      </div>
    );
  }

  if (loadingWatchlists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading your watchlists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Your Watchlists</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Watchlist
          </button>

          <button
            type="button"
            onClick={handleDeleteButtonClick}
            className="px-4 py-2 rounded-md text-sm font-medium border border-red-500 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Delete Watchlists
          </button>
        </div>
      </div>

      {watchlists.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              You don't have any watchlists yet
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Create your first watchlist using the form above.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Watchlist Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {watchlists.map(list => (
                <button
                  key={list.watchlist_id}
                  type="button"
                  onClick={() => handleSelectWatchlist(list)}
                  className={`rounded-lg border shadow-sm p-4 bg-white text-left hover:shadow-md transition-shadow ${
                    selectedWatchlist &&
                    selectedWatchlist.watchlist_id === list.watchlist_id
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-lg text-gray-800 truncate">
                    {list.name || 'Untitled Watchlist'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created on {new Date(list.created_at).toISOString().split('T')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedWatchlist && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {selectedWatchlist.name || 'Untitled Watchlist'}
              </h2>

              {loadingMovies ? (
                <div className="min-h-[20vh] flex items-center justify-center">
                  <div className="text-gray-600 text-lg">
                    Loading movies...
                  </div>
                </div>
              ) : movies.length === 0 ? (
                <div className="min-h-[20vh] flex items-center justify-center">
                  <div className="text-gray-500 text-sm">
                    This watchlist has no movies yet.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {movies.map(movie => (
                    <div
                      key={movie.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                    >
                      {movie.image && (
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="w-full h-64 object-cover"
                        />
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold mb-1">{movie.title}</h3>
                        <p className="text-gray-600 text-sm mb-1">{movie.year}</p>
                        <p className="text-gray-500 text-xs mb-2">
                          Added on {movie.addedDate}
                        </p>
                        <div className="mt-auto">
                          <button
                            onClick={() => handleRemoveMovie(movie.id)}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Watchlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Watchlist Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Family Night"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows={3}
                  placeholder="Optional description for this watchlist"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewName('');
                  setNewDescription('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creating}
                onClick={handleCreateWatchlist}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Watchlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delete Watchlists</h2>
            {watchlists.length === 0 ? (
              <div className="text-sm text-gray-600">You have no watchlists to delete.</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {watchlists.map(list => (
                  <div
                    key={list.watchlist_id}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
                    <div className="mr-3">
                      <div className="font-medium text-sm text-gray-900">
                        {list.name || 'Untitled Watchlist'}
                      </div>
                      {list.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {list.description}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!user) return;
                        const confirmed = window.confirm(
                          `Delete watchlist "${list.name || 'Untitled Watchlist'}" and all its movies?`
                        );
                        if (!confirmed) return;

                        try {
                          const ids = [list.watchlist_id];

                          const { error: itemsError } = await supabase
                            .from('watchlist_items')
                            .delete()
                            .in('watchlist_id', ids);
                          if (itemsError) throw itemsError;

                          const { error: listError } = await supabase
                            .from('watchlists')
                            .delete()
                            .in('watchlist_id', ids);
                          if (listError) throw listError;

                          const { data, error: reloadError } = await supabase
                            .from('watchlists')
                            .select('watchlist_id, name, description, created_at')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: true });

                          if (reloadError) throw reloadError;

                          setWatchlists(data || []);

                          if (data && data.length > 0) {
                            setSelectedWatchlist(data[0]);
                            await fetchMoviesForWatchlist(data[0]);
                          } else {
                            setSelectedWatchlist(null);
                            setMovies([]);
                          }
                        } catch (err) {
                          console.error('Error deleting watchlist from modal:', err);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}