// client/src/pages/Profile/ProfileComments.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getMovieDetails, getImageUrl } from '../../api/tmdb';

type NoteRow = {
  movie_id: number;
  body: string | null;
  updated_at?: string | null;
};

type LocalNote = {
  movieId: number;
  body: string;
  updated_at: string | null;
};

type MovieSummary = {
  id: number;
  title: string;
  year: number;
  rating: number;
  image: string | null;
};

type CommentItem = {
  movieId: number;
  body: string;
  updated_at: string | null;
  movie?: MovieSummary;
};

const getPosterFallbackDataUrl = (title: string) => {
  const safeTitle = (title || 'No Image').slice(0, 40);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="#111827"/>
  <rect x="16" y="16" width="268" height="418" rx="16" fill="#1f2937"/>
  <text x="150" y="225" text-anchor="middle" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="16">
    <tspan x="150" dy="0">${safeTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>
  </text>
  <text x="150" y="255" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">No poster available</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const parseLocalNoteValue = (raw: string): { body: string; updated_at: string | null } => {
  // Backward compat:
  // - old: raw note body string
  // - new: JSON { body, updated_at }
  try {
    const parsed = JSON.parse(raw);
    const body = (parsed as any)?.body;
    const updated_at = (parsed as any)?.updated_at;
    return {
      body: typeof body === 'string' ? body : '',
      updated_at: typeof updated_at === 'string' ? updated_at : null,
    };
  } catch {
    return { body: raw, updated_at: null };
  }
};

export default function ProfileComments() {
  const { user } = useAuth();
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localPrefix = useMemo(() => (user?.id ? `movie_note:${user.id}:` : 'movie_note:anon:'), [user?.id]);

  useEffect(() => {
    const loadFromLocalStorage = (): LocalNote[] => {
      if (!user?.id) return [];
      const out: LocalNote[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || !k.startsWith(localPrefix)) continue;
          const movieIdStr = k.slice(localPrefix.length);
          const movieId = Number(movieIdStr);
          if (!Number.isFinite(movieId)) continue;
          const raw = localStorage.getItem(k);
          if (typeof raw !== 'string' || !raw) continue;
          const parsed = parseLocalNoteValue(raw);
          const body = parsed.body.trim();
          if (!body) continue;
          out.push({ movieId, body, updated_at: parsed.updated_at });
        }
      } catch {
        return [];
      }
      return out;
    };

    const loadNotes = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const localNotes = loadFromLocalStorage().map((n) => ({
        movieId: n.movieId,
        body: n.body,
        updated_at: n.updated_at,
      }));

      let remoteNotes: Array<{ movieId: number; body: string; updated_at: string | null }> = [];
      try {
        const { data, error: noteErr } = await supabase
          .from('notes')
          .select('movie_id, body, updated_at')
          .eq('user_id', user.id);

        if (noteErr) throw noteErr;

        remoteNotes = ((data || []) as NoteRow[])
          .map((r) => ({
            movieId: r.movie_id,
            body: typeof r.body === 'string' ? r.body : '',
            updated_at: typeof r.updated_at === 'string' ? r.updated_at : null,
          }))
          .filter((n) => n.body.trim().length > 0);
      } catch {
        remoteNotes = [];
        setError('Cloud sync unavailable — showing device-local comments only.');
      }

      // Merge local + remote (prefer the most recently updated per movie)
      const merged = new Map<number, { movieId: number; body: string; updated_at: string | null }>();
      const mergeOne = (n: { movieId: number; body: string; updated_at: string | null }) => {
        const existing = merged.get(n.movieId);
        if (!existing) {
          merged.set(n.movieId, n);
          return;
        }

        const at = n.updated_at ? new Date(n.updated_at).getTime() : 0;
        const bt = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
        if (at >= bt) merged.set(n.movieId, n);
      };

      [...localNotes, ...remoteNotes].forEach(mergeOne);

      const notes = Array.from(merged.values());

      // If there are any notes with missing updated_at, treat as very old.
      notes.sort((a, b) => {
        const at = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bt = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bt - at;
      });

      // Fetch movie summaries
      const uniqueMovieIds = Array.from(new Set(notes.map((n) => n.movieId)));
      const movieMap = new Map<number, MovieSummary>();

      await Promise.all(
        uniqueMovieIds.map(async (movieId) => {
          try {
            const details = await getMovieDetails(String(movieId));
            if (!details) return;
            movieMap.set(movieId, {
              id: details.id,
              title: details.title,
              year: details.release_date ? new Date(details.release_date).getFullYear() : 0,
              rating: typeof details.vote_average === 'number' ? details.vote_average : 0,
              image: getImageUrl(details.poster_path, 'w500') || null,
            });
          } catch {
            // ignore per-movie failures
          }
        })
      );

      setItems(
        notes.map((n) => ({
          movieId: n.movieId,
          body: n.body,
          updated_at: n.updated_at,
          movie: movieMap.get(n.movieId),
        }))
      );

      setLoading(false);
    };

    void loadNotes();
  }, [localPrefix, user]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Recent Comments</h2>
        <Link to="/search" className="text-sm text-blue-600 hover:underline">Find movies</Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <>
          {error && <div className="mb-3 text-sm text-amber-700">{error}</div>}

          {items.length === 0 ? (
            <div className="text-sm text-gray-600">No saved comments yet. Add a note on any movie details page.</div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => {
                const title = it.movie?.title || `Movie #${it.movieId}`;
                const poster = it.movie?.image || getPosterFallbackDataUrl(title);
                const year = it.movie?.year || 0;
                const rating = it.movie?.rating || 0;

                return (
                  <Link
                    key={`note-${it.movieId}`}
                    to={`/movies/${it.movieId}`}
                    className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={poster}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = getPosterFallbackDataUrl(title);
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{title}</div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {year ? `${year}` : '—'}
                              <span className="mx-2">•</span>
                              {rating ? `Rating ${rating.toFixed(1)}` : 'Rating —'}
                              {it.updated_at ? (
                                <>
                                  <span className="mx-2">•</span>
                                  {new Date(it.updated_at).toLocaleString()}
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                    <div className="mt-2 text-sm text-gray-800 line-clamp-3 whitespace-pre-wrap">
                      {it.body}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
