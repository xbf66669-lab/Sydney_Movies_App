import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MovieCard } from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  media_type: 'movie' | 'tv';
};

type WatchlistRow = {
  watchlist_id: number;
  name: string | null;
};

type TvWatchlistItem = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
};

type TvByWatchlist = Record<string, TvWatchlistItem[]>;

type RecentMovie = {
  id: number;
  title: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  overview?: string;
};

const getTvByWatchlistStorageKey = (userId?: string) =>
  userId ? `tv_watchlist_by_list:${userId}` : 'tv_watchlist_by_list:anon';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [recentMovies, setRecentMovies] = useState<RecentMovie[]>([]);
  const [browseMovies, setBrowseMovies] = useState<RecentMovie[]>([]);
  const [browsePage, setBrowsePage] = useState(1);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [browseHasMore, setBrowseHasMore] = useState(true);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [isSelectTvWatchlistsOpen, setIsSelectTvWatchlistsOpen] = useState(false);
  const [tvModalItem, setTvModalItem] = useState<SearchResult | null>(null);
  const [watchlists, setWatchlists] = useState<WatchlistRow[]>([]);
  const [watchlistsLoading, setWatchlistsLoading] = useState(false);
  const [selectedWatchlistIds, setSelectedWatchlistIds] = useState<number[]>([]);

  const tvStorageKey = useMemo(() => getTvByWatchlistStorageKey(user?.id), [user?.id]);

  const recentStorageKey = useMemo(
    () => (user?.id ? `recent_search_movies:${user.id}` : 'recent_search_movies:anon'),
    [user?.id]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recentStorageKey);
      if (!raw) {
        setRecentMovies([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setRecentMovies(Array.isArray(parsed) ? (parsed as RecentMovie[]) : []);
    } catch {
      setRecentMovies([]);
    }
  }, [recentStorageKey]);

  const readTvByWatchlist = (): TvByWatchlist => {
    try {
      const raw = localStorage.getItem(tvStorageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as TvByWatchlist) : {};
    } catch {
      return {};
    }
  };

  const writeTvByWatchlist = (data: TvByWatchlist) => {
    localStorage.setItem(tvStorageKey, JSON.stringify(data));
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
      setWatchlists((data || []) as WatchlistRow[]);
    } catch (e) {
      console.error(e);
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

  const getTvTrailerUrl = async (tvId: number): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${tvId}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
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

  const openSelectTvWatchlists = async (item: SearchResult) => {
    if (!user) return;
    setTvModalItem(item);
    await loadUserWatchlists();

    const byList = readTvByWatchlist();
    const preSelected: number[] = [];
    for (const key of Object.keys(byList)) {
      const listId = Number(key);
      if (!Number.isFinite(listId)) continue;
      if ((byList[key] || []).some((x) => x.id === item.id)) preSelected.push(listId);
    }
    setSelectedWatchlistIds(preSelected);
    setIsSelectTvWatchlistsOpen(true);
  };

  const confirmAddTvToSelectedWatchlists = async () => {
    if (!user || !tvModalItem) return;
    const item = tvModalItem;

    if (watchlists.length === 0) {
      try {
        setWatchlistsLoading(true);
        const { data, error } = await supabase
          .from('watchlists')
          .insert([
            {
              user_id: user.id,
              name: 'My Watchlist',
            },
          ])
          .select('watchlist_id, name')
          .single();
        if (error) throw error;
        const created = data as WatchlistRow;
        setWatchlists([created]);
        setSelectedWatchlistIds([created.watchlist_id]);
      } catch (e) {
        console.error(e);
        setWatchlistsLoading(false);
        return;
      } finally {
        setWatchlistsLoading(false);
      }
    }

    const targetIds = selectedWatchlistIds.length
      ? selectedWatchlistIds
      : watchlists.length
        ? [watchlists[0].watchlist_id]
        : [];

    if (!targetIds.length) {
      setIsSelectTvWatchlistsOpen(false);
      return;
    }

    const title = item.name || item.title || 'Untitled';
    const releaseDate = item.first_air_date || item.release_date;

    const byList = readTvByWatchlist();
    for (const wid of targetIds) {
      const key = String(wid);
      const existing = Array.isArray(byList[key]) ? byList[key] : [];
      if (existing.some((x) => x.id === item.id)) continue;
      byList[key] = [
        ...existing,
        {
          id: item.id,
          title,
          poster_path: item.poster_path,
          release_date: releaseDate,
          vote_average: item.vote_average,
        },
      ];
    }
    writeTvByWatchlist(byList);

    setIsSelectTvWatchlistsOpen(false);
    setTvModalItem(null);
    setSelectedWatchlistIds([]);
  };

  const runSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(trimmed)}`
      );
      const data = await response.json();
      const results = (data?.results || []) as any[];
      const filtered = results.filter((r) => r?.media_type === 'movie' || r?.media_type === 'tv');
      setSearchResults(filtered as SearchResult[]);

      // Update recent movies list based on results
      try {
        const movies = (filtered as SearchResult[])
          .filter((r) => r.media_type === 'movie')
          .slice(0, 6)
          .map((m) => ({
            id: m.id,
            title: m.title || 'Untitled',
            poster_path: m.poster_path,
            vote_average: m.vote_average,
            release_date: m.release_date,
            overview: m.overview,
          }));

        if (movies.length) {
          setRecentMovies((prev) => {
            const merged = [...movies, ...prev];
            const seen = new Set<number>();
            const unique = merged.filter((x) => {
              if (seen.has(x.id)) return false;
              seen.add(x.id);
              return true;
            });
            const trimmedList = unique.slice(0, 12);
            localStorage.setItem(recentStorageKey, JSON.stringify(trimmedList));
            return trimmedList;
          });
        }
      } catch {
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrowseMovies = async (page: number) => {
    setBrowseLoading(true);
    setBrowseError(null);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`
      );
      const data = await res.json();
      const results = Array.isArray(data?.results) ? (data.results as any[]) : [];
      const mapped: RecentMovie[] = results.map((m: any) => ({
        id: m.id,
        title: m.title || 'Untitled',
        poster_path: m.poster_path,
        vote_average: m.vote_average,
        release_date: m.release_date,
        overview: m.overview,
      }));

      setBrowseMovies((prev) => {
        const merged = [...prev, ...mapped];
        const seen = new Set<number>();
        return merged.filter((x) => {
          if (seen.has(x.id)) return false;
          seen.add(x.id);
          return true;
        });
      });

      const totalPages = typeof data?.total_pages === 'number' ? data.total_pages : 1;
      setBrowseHasMore(page < totalPages && mapped.length > 0);
    } catch (e) {
      console.error(e);
      setBrowseError('Failed to load movies.');
      setBrowseHasMore(false);
    } finally {
      setBrowseLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q.trim()) {
      runSearch(q);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (query.trim()) return;
    setBrowseMovies([]);
    setBrowsePage(1);
    setBrowseHasMore(true);
    void fetchBrowseMovies(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setSearchParams({ q });
    await runSearch(q);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-24 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search for movies..."
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {!query.trim() && recentMovies.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Recently searched</h2>
              <button
                type="button"
                onClick={() => {
                  setRecentMovies([]);
                  try {
                    localStorage.removeItem(recentStorageKey);
                  } catch {
                  }
                }}
                className="text-sm text-gray-300 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentMovies.slice(0, 8).map((m) => (
                <MovieCard
                  key={`recent-${m.id}`}
                  movie={m}
                  showQuickActions
                />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg" />
                <div className="mt-2 h-4 bg-gray-800 rounded w-3/4" />
                <div className="mt-2 h-4 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((item) => (
              item.media_type === 'movie' ? (
                <MovieCard
                  key={`movie-${item.id}`}
                  movie={{
                    id: item.id,
                    title: item.title || 'Untitled',
                    poster_path: item.poster_path,
                    vote_average: item.vote_average,
                    release_date: item.release_date,
                    overview: item.overview,
                  }}
                  showQuickActions
                />
              ) : (
                <div
                  key={`tv-${item.id}`}
                  className="group overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 shadow-lg"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const key = `tv:${item.id}`;
                          setOpenMenuKey((prev) => (prev === key ? null : key));
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-black/50 hover:bg-black/70 text-white"
                        aria-label="TV quick actions"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                        </svg>
                      </button>

                      {openMenuKey === `tv:${item.id}` && (
                        <div className="absolute right-0 mt-2 w-52 rounded-lg bg-gray-900 border border-white/10 shadow-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuKey(null);
                              openSelectTvWatchlists(item);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10"
                          >
                            Add to Watchlist
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuKey(null);
                              const url = await getTvTrailerUrl(item.id);
                              if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10"
                          >
                            View Trailer
                          </button>
                        </div>
                      )}
                    </div>

                    <Link to={`/tv/${item.id}`}>
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiB2aWV3Qm94PSIwIDAgMzAwIDQ1MCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxMTE4MjciLz48L3N2Zz4='}
                        alt={item.name || item.title || 'TV Show'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">
                      <Link to={`/tv/${item.id}`} className="hover:underline">
                        {item.name || item.title || 'Untitled'}
                      </Link>
                    </h3>
                    {(item.first_air_date || item.release_date) && (
                      <p className="text-sm text-gray-300 mt-1">
                        {new Date(item.first_air_date || item.release_date || '').getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-12 text-gray-400">No results found for "{query.trim()}"</div>
        ) : (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Popular right now</h2>
              <Link to="/recommendations" className="text-sm text-blue-300 hover:underline">For you</Link>
            </div>

            {browseError && <div className="text-sm text-red-400 mb-3">{browseError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {browseMovies.map((m) => (
                <MovieCard key={`browse-${m.id}`} movie={m} showQuickActions />
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                disabled={browseLoading || !browseHasMore}
                onClick={() => {
                  const next = browsePage + 1;
                  setBrowsePage(next);
                  void fetchBrowseMovies(next);
                }}
                className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white disabled:opacity-50"
              >
                {browseLoading ? 'Loading…' : browseHasMore ? 'Load more' : 'No more movies'}
              </button>
            </div>
          </div>
        )}
      </div>

      {isSelectTvWatchlistsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add TV Show to Watchlists</h2>
            {!user ? (
              <div className="text-sm text-gray-700">Please sign in to manage your watchlists.</div>
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
                    <span className="text-sm text-gray-800">{list.name || 'Untitled Watchlist'}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSelectTvWatchlistsOpen(false);
                  setTvModalItem(null);
                  setSelectedWatchlistIds([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={watchlistsLoading}
                onClick={confirmAddTvToSelectedWatchlists}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {watchlistsLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
