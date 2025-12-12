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
  addToMultipleWatchlists: (movie: Omit<Movie, 'addedDate'>, watchlistIds: number[]) => Promise<void>;
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
      // 1) Get one watchlist row for this user (supports multiple seeded lists)
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('watchlist_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (watchlistError) {
        console.error('watchlists select error in fetchWatchlist:', watchlistError);
        setWatchlist([]);
        return;
      }
      if (!watchlistData) {
        setWatchlist([]);
        return;
      }

      // 2) Get items in that watchlist
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('movie_id, added_at')
        .eq('watchlist_id', watchlistData.watchlist_id);

      if (error) throw error;

      // 3) For each movie_id, hydrate from TMDb
      const movies: Movie[] = data
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
      // 1) Get or create user's watchlist row (choose a single default if multiple exist)
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('watchlist_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      let watchlistId: number;

      if (watchlistError) {
        console.error('watchlists select error in addToWatchlist:', watchlistError);
        throw watchlistError;
      }

      if (!watchlistData) {
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

      // 2) Ensure the movie exists in movies table (link TMDb → Supabase)
      const details = await getMovieDetails(String(movie.id));

      const { error: movieUpsertError } = await supabase
        .from('movies')
        .upsert(
          {
            movie_id: movie.id, // TMDb id
            title: details.title,
            release_year: details.release_date
              ? new Date(details.release_date).getFullYear()
              : null,
            age_rating: details.adult ? 'R' : 'PG-13',
            runtime_minutes: details.runtime || 0,
            original_language: details.original_language || 'en',
            average_viewer_rating: details.vote_average,
            poster_url: getImageUrl(details.poster_path, 'w500') || null,
          },
          { onConflict: 'movie_id' }
        );

      if (movieUpsertError) throw movieUpsertError;

      // 3) Add relation row in watchlist_items
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

      // 4) Update local state
      setWatchlist(prev => {
        const exists = prev.some(m => m.id === movie.id);
        if (exists) return prev;

        return [
          ...prev,
          {
            ...movie,
            addedDate: new Date().toISOString().split('T')[0],
          },
        ];
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const addToMultipleWatchlists = async (
    movie: Omit<Movie, 'addedDate'>,
    watchlistIds: number[]
  ) => {
    if (!user) throw new Error('User must be logged in to add to watchlists');
    if (!watchlistIds.length) return;

    try {
      // Ensure movie exists in movies table once
      const details = await getMovieDetails(String(movie.id));

      const { error: movieUpsertError } = await supabase
        .from('movies')
        .upsert(
          {
            movie_id: movie.id,
            title: details.title,
            release_year: details.release_date
              ? new Date(details.release_date).getFullYear()
              : null,
            age_rating: details.adult ? 'R' : 'PG-13',
            runtime_minutes: details.runtime || 0,
            original_language: details.original_language || 'en',
            average_viewer_rating: details.vote_average,
            poster_url: getImageUrl(details.poster_path, 'w500') || null,
          },
          { onConflict: 'movie_id' }
        );

      if (movieUpsertError) throw movieUpsertError;

      // Add relation rows for each selected watchlist
      const rows = watchlistIds.map(id => ({
        watchlist_id: id,
        movie_id: movie.id,
        is_watched: false,
        added_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('watchlist_items')
        .upsert(rows, { onConflict: 'watchlist_id,movie_id' });

      if (error) throw error;

      // Local default watchlist state: if movie already present, do nothing; otherwise append
      setWatchlist(prev => {
        const exists = prev.some(m => m.id === movie.id);
        if (exists) return prev;

        return [
          ...prev,
          {
            ...movie,
            addedDate: new Date().toISOString().split('T')[0],
          },
        ];
      });
    } catch (error) {
      console.error('Error adding to multiple watchlists:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) throw new Error('User must be logged in to remove from watchlist');

    try {
      // 1) Get user's watchlist id
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('watchlist_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (watchlistError || !watchlistData) {
        console.error('watchlists select error in removeFromWatchlist:', watchlistError);
        return;
      }

      // 2) Delete from watchlist_items
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('watchlist_id', watchlistData.watchlist_id)
        .eq('movie_id', movieId);

      if (error) throw error;

      // 3) Update local state
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
        addToMultipleWatchlists,
        removeFromWatchlist,
        isInWatchlist,
        loading,
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