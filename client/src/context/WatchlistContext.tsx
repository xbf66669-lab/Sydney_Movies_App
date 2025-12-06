// client/src/context/WatchlistContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { getMovieDetails, getImageUrl } from '../api/tmdb';

type Movie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  image: string;
  addedDate: string;
};

type WatchlistContextType = {
  watchlist: Movie[];
  addToWatchlist: (movie: Omit<Movie, 'addedDate'>) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
  loading: boolean;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // First, get the user's watchlist ID
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('watchlist_id')
        .eq('user_id', user.id)
        .single();

      if (watchlistError) throw watchlistError;
      if (!watchlistData) {
        setWatchlist([]);
        return;
      }

      // Then get the watchlist items
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('movie_id, added_at')
        .eq('watchlist_id', watchlistData.watchlist_id);

      if (error) throw error;

      const movies: Movie[] = data
        ? await Promise.all(
            data.map(async (item: any) => {
              const details = await getMovieDetails(String(item.movie_id));
              const posterUrl = details ? getImageUrl(details.poster_path, 'w500') : null;

              return {
                id: details.id,
                title: details.title,
                year: new Date(details.release_date).getFullYear(),
                rating: details.vote_average,
                genre:
                  details.genres?.map((g: { id: number; name: string }) => g.name) || [],
                image: posterUrl || '',

                addedDate: item.added_at
                  ? new Date(item.added_at).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0],
              };
            })
          )
        : [];

      setWatchlist(movies);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (movie: Omit<Movie, 'addedDate'>) => {
    if (!user) throw new Error('User must be logged in to add to watchlist');

    try {
      // Get or create user's watchlist
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('watchlist_id')
        .eq('user_id', user.id)
        .single();

      let watchlistId: number;

      if (watchlistError || !watchlistData) {
        const { data: newWatchlist, error: createError } = await supabase
          .from('watchlists')
          .insert([
            {
              user_id: user.id,
              name: 'My Watchlist',
            },
          ])
          .select('watchlist_id')
          .single();

        if (createError) throw createError;
        watchlistId = newWatchlist.watchlist_id;
      } else {
        watchlistId = watchlistData.watchlist_id;
      }

      // Ensure the movie exists in the movies table to satisfy FK
      const details = await getMovieDetails(String(movie.id));

      const { error: movieUpsertError } = await supabase
        .from('movies')
        .upsert(
          {
            movie_id: movie.id,
            title: details.title,
            release_year: new Date(details.release_date).getFullYear(),
            age_rating: details.adult ? 'R' : 'PG-13',
            runtime_minutes: details.runtime || 0,
            original_language: details.original_language || 'en',
            average_viewer_rating: details.vote_average,
            poster_url: getImageUrl(details.poster_path, 'w500') || null,
          },
          { onConflict: 'movie_id' }
        );

      if (movieUpsertError) throw movieUpsertError;

      // Add movie to watchlist (store only relations)
      const { error } = await supabase
        .from('watchlist_items')
        .upsert(
          {
            watchlist_id: watchlistId,
            movie_id: movie.id,
            is_watched: false,
            added_at: new Date().toISOString(),
          },
          { onConflict: 'watchlist_id,movie_id' }
        );

      if (error) throw error;

      // Update local state
      setWatchlist(prev => [
        ...prev,
        {
          ...movie,
          addedDate: new Date().toISOString().split('T')[0],
        },
      ]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) throw new Error('User must be logged in to remove from watchlist');

    try {
      // First get the watchlist ID
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('watchlist_id')
        .eq('user_id', user.id)
        .single();

      if (watchlistError || !watchlistData) {
        console.error('No watchlist found for user');
        return;
      }

      // Then delete the item
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('watchlist_id', watchlistData.watchlist_id)
        .eq('movie_id', movieId);

      if (error) throw error;

      // Update local state
      setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  return (
    <WatchlistContext.Provider 
      value={{ 
        watchlist, 
        addToWatchlist, 
        removeFromWatchlist, 
        isInWatchlist,
        loading
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}