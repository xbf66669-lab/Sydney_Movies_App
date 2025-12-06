import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';

interface Movie {
  id: number;
  title: string;
  year: string;
  image: string;
  rating: number;
  genre: string[];
  addedDate: string;
}

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Omit<Movie, 'addedDate'>) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  addToWatchlist: async () => {},
  removeFromWatchlist: async () => {},
  isInWatchlist: () => false,
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching watchlist:', error);
      return;
    }

    setWatchlist(data?.map(item => item.movie_data) || []);
  };

  const addToWatchlist = async (movie: Omit<Movie, 'addedDate'>) => {
    if (!user) return;

    const movieWithDate = {
      ...movie,
      addedDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    };

    const { error } = await supabase
      .from('watchlist')
      .upsert(
        [
          {
            user_id: user.id,
            movie_id: movie.id,
            movie_data: movieWithDate,
          },
        ],
        { onConflict: 'user_id,movie_id' }
      );

    if (error) {
      console.error('Error adding to watchlist:', error);
      return;
    }

    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      return exists ? prev : [...prev, movieWithDate];
    });
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movieId);

    if (error) {
      console.error('Error removing from watchlist:', error);
      return;
    }

    setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((movie) => movie.id === movieId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
// In Watchlist.tsx, at the end of the file, add:
export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Your watchlist is empty</h2>
          <p className="mt-2 text-gray-500">Add some movies to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {watchlist.map((movie) => (
          <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{movie.title}</h3>
              <p className="text-gray-600">{movie.year}</p>
              <button
                onClick={() => removeFromWatchlist(movie.id)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}