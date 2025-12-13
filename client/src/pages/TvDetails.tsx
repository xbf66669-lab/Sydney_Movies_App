import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, getTvDetails } from '../api/tmdb';
import { supabase } from '../lib/supabase';

type TvWatchlistItem = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
};

type WatchlistRow = {
  watchlist_id: number;
  name: string | null;
};

type TvByWatchlist = Record<string, TvWatchlistItem[]>;

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

const getTvByWatchlistStorageKey = (userId?: string) =>
  userId ? `tv_watchlist_by_list:${userId}` : 'tv_watchlist_by_list:anon';

export default function TvDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const storageKey = useMemo(() => getTvByWatchlistStorageKey(user?.id), [user?.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tv, setTv] = useState<any>(null);
  const [isSelectWatchlistsOpen, setIsSelectWatchlistsOpen] = useState(false);
  const [watchlists, setWatchlists] = useState<WatchlistRow[]>([]);
  const [watchlistsLoading, setWatchlistsLoading] = useState(false);
  const [selectedWatchlistIds, setSelectedWatchlistIds] = useState<number[]>([]);

  const readTvByWatchlist = (): TvByWatchlist => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as TvByWatchlist) : {};
    } catch {
      return {};
    }
  };

  const writeTvByWatchlist = (data: TvByWatchlist) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTvDetails(String(id));
        if (!data || typeof data !== 'object' || typeof data.id !== 'number') {
          setError('TV show not found.');
          setTv(null);
          return;
        }

        const posterUrl = getImageUrl(data.poster_path, 'w500');
        setTv({
          ...data,
          title: data.name,
          year: data.first_air_date ? new Date(data.first_air_date).getFullYear() : 0,
          rating: typeof data.vote_average === 'number' ? data.vote_average : 0,
          image: posterUrl || '',
        });
      } catch (e) {
        console.error(e);
        setError('Failed to load TV show details.');
        setTv(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, storageKey]);

  const handleOpenSelectWatchlists = async () => {
    if (!tv || !user) return;
    await loadUserWatchlists();
    const byList = readTvByWatchlist();
    const preSelected: number[] = [];
    for (const key of Object.keys(byList)) {
      const wid = Number(key);
      if (!Number.isFinite(wid)) continue;
      if ((byList[key] || []).some((x) => x.id === tv.id)) preSelected.push(wid);
    }
    setSelectedWatchlistIds(preSelected);
    setIsSelectWatchlistsOpen(true);
  };

  const handleConfirmAddToWatchlists = async () => {
    if (!tv || !user) return;

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
      setIsSelectWatchlistsOpen(false);
      return;
    }

    const byList = readTvByWatchlist();
    for (const wid of targetIds) {
      const key = String(wid);
      const existing = Array.isArray(byList[key]) ? byList[key] : [];
      if (existing.some((x) => x.id === tv.id)) continue;
      byList[key] = [
        ...existing,
        {
          id: tv.id,
          title: tv.title,
          poster_path: tv.poster_path,
          release_date: tv.first_air_date,
          vote_average: tv.vote_average,
        },
      ];
    }
    writeTvByWatchlist(byList);
    setIsSelectWatchlistsOpen(false);
    setSelectedWatchlistIds([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-8">
          <div className="text-red-400 mb-6">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!tv) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300"
          >
            Back
          </button>
          <Link
            to="/watchlist"
            className="text-sm text-gray-200 hover:text-white underline"
          >
            View Watchlist
          </Link>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 lg:w-1/4">
              <img
                src={tv.image || getPosterFallbackDataUrl(tv.title)}
                alt={tv.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getPosterFallbackDataUrl(tv.title);
                }}
              />
            </div>

            <div className="p-8 md:w-2/3 lg:w-3/4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    {tv.title} <span className="text-gray-400">({tv.year || '—'})</span>
                  </h1>
                  <div className="mt-3 text-gray-300">
                    {tv.number_of_seasons ? `${tv.number_of_seasons} seasons` : ''}
                    {tv.number_of_episodes ? ` • ${tv.number_of_episodes} episodes` : ''}
                  </div>
                  <div className="mt-3 text-gray-300">
                    Rating: {typeof tv.rating === 'number' ? tv.rating.toFixed(1) : '—'}
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleOpenSelectWatchlists}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium"
                  >
                    Add to Watchlist
                  </button>
                </div>
              </div>

              <div className="mt-8 bg-black/30 p-6 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {tv.overview || 'No overview available.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isSelectWatchlistsOpen && (
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
                    setIsSelectWatchlistsOpen(false);
                    setSelectedWatchlistIds([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={watchlistsLoading}
                  onClick={handleConfirmAddToWatchlists}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {watchlistsLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
