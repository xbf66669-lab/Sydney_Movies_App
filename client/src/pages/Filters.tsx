import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type TmdbGenre = {
  id: number;
  name: string;
};

type MediaType = 'movie' | 'tv';

type SavedPreferences = {
  mediaType: MediaType;
  genreIds: number[];
  yearFrom: number | null;
  yearTo: number | null;
};

const clampYear = (value: number | null) => {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  if (value < 1900) return 1900;
  const current = new Date().getFullYear();
  if (value > current) return current;
  return Math.floor(value);
};

export default function Filters() {
  const { user } = useAuth();
  const [genres, setGenres] = useState<TmdbGenre[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [yearFrom, setYearFrom] = useState<number | null>(null);
  const [yearTo, setYearTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const storageKey = useMemo(() => {
    return user?.id ? `user_preferences:${user.id}` : 'user_preferences:anon';
  }, [user?.id]);

  // Load saved preferences (safe + backward compatible)
  useEffect(() => {
    const loadSaved = async () => {
      setError(null);
      try {
        const local = localStorage.getItem(storageKey);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            // Backward compat: older builds stored just genre IDs array
            setSelectedGenreIds(parsed.filter((x) => typeof x === 'number'));
          } else if (parsed && typeof parsed === 'object') {
            const maybe = parsed as Partial<SavedPreferences>;
            if (maybe.mediaType === 'movie' || maybe.mediaType === 'tv') setMediaType(maybe.mediaType);
            if (Array.isArray(maybe.genreIds)) setSelectedGenreIds(maybe.genreIds.filter((x) => typeof x === 'number'));
            if (typeof maybe.yearFrom === 'number') setYearFrom(clampYear(maybe.yearFrom));
            if (typeof maybe.yearTo === 'number') setYearTo(clampYear(maybe.yearTo));
          }
        }

      } catch (_e) {
      }
    };

    loadSaved();
  }, [storageKey, user?.id]);

  // Load TMDb genres for the selected media type
  useEffect(() => {
    const loadGenres = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await res.json();
        setGenres((data?.genres || []) as TmdbGenre[]);

        // Clear selections that no longer exist in this media type
        const allowed = new Set(((data?.genres || []) as TmdbGenre[]).map((g) => g.id));
        setSelectedGenreIds((prev) => prev.filter((id) => allowed.has(id)));
      } catch (e) {
        setError('Failed to load genres.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadGenres();
  }, [mediaType]);

  const toggleGenre = (id: number) => {
    setSelectedGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const savePreferences = async () => {
    setSaving(true);
    setSavedMessage(null);
    setError(null);

    const payload: SavedPreferences = {
      mediaType,
      genreIds: selectedGenreIds,
      yearFrom: clampYear(yearFrom),
      yearTo: clampYear(yearTo),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      // Keep old key for backward compatibility with older builds
      if (user?.id) {
        localStorage.setItem(`movie_genre_preferences:${user.id}`, JSON.stringify(payload.genreIds));
      }

      setSavedMessage('Saved.');
      setTimeout(() => setSavedMessage(null), 1500);
    } catch (e) {
      setError('Failed to save preferences.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Filters & Preferences</h1>
            <p className="text-gray-300">What you choose here influences your recommendations.</p>
          </div>
          <button
            onClick={savePreferences}
            disabled={saving || loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {error && <div className="mb-4 text-red-400">{error}</div>}
        {savedMessage && <div className="mb-4 text-green-400">{savedMessage}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-3">Type</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/40 border border-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="mediaType"
                  checked={mediaType === 'movie'}
                  onChange={() => setMediaType('movie')}
                  className="h-4 w-4"
                />
                <span className="text-gray-200">Movies</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/40 border border-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="mediaType"
                  checked={mediaType === 'tv'}
                  onChange={() => setMediaType('tv')}
                  className="h-4 w-4"
                />
                <span className="text-gray-200">Series</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-3">Year Made</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">From</label>
                <input
                  type="number"
                  value={yearFrom ?? ''}
                  onChange={(e) => setYearFrom(e.target.value ? clampYear(Number(e.target.value)) : null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      savePreferences();
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900/40 border border-gray-700 text-white"
                  placeholder="e.g. 1990"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">To</label>
                <input
                  type="number"
                  value={yearTo ?? ''}
                  onChange={(e) => setYearTo(e.target.value ? clampYear(Number(e.target.value)) : null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      savePreferences();
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900/40 border border-gray-700 text-white"
                  placeholder="e.g. 2025"
                />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              Tip: Leave blank for "any year".
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 lg:col-span-1">
            <h2 className="text-lg font-semibold mb-3">Genres</h2>
            {loading ? (
              <div className="text-gray-300">Loading…</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-auto pr-1">
                {genres.map((g) => (
                  <label
                    key={g.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/40 hover:bg-gray-900/60 border border-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenreIds.includes(g.id)}
                      onChange={() => toggleGenre(g.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-gray-200">{g.name}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-4 text-sm text-gray-400">Selected: {selectedGenreIds.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
