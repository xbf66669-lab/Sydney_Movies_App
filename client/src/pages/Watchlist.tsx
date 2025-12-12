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
  image: string;
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
        ? await Promise.all(
            data.map(async (item: any) => {
              const details = await getMovieDetails(String(item.movie_id));
              const posterUrl = details ? getImageUrl(details.poster_path, 'w500') : null;

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
                image: posterUrl || '',
                addedDate: item.added_at
                  ? new Date(item.added_at).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0],
              };
            })
          )
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

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
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
          },
        ])
        .select('watchlist_id, name, description, created_at')
        .single();

      if (error) throw error;

      const created = data as WatchlistRow;
      setWatchlists(prev => [...prev, created]);
      setNewName('');
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

        <form onSubmit={handleCreateWatchlist} className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Create new watchlist"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? 'Creating...' : 'Add Watchlist'}
          </button>
        </form>
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
                  className={`text-left rounded-lg border shadow-sm p-4 bg-white hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                    Created on{' '}
                    {new Date(list.created_at).toISOString().split('T')[0]}
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
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-64 object-cover"
                      />
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
    </div>
  );
}