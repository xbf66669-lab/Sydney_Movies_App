// api/src/controllers/movieController.js

const supabase = require('../config/supabase');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const getMovies = async (req, res, next) => {
  try {
    const {
      q,
      // genreId,  // TODO: implement via movie_genres join if needed
      ageRating,
      language,
      runtimeMin,
      runtimeMax,
      sortBy = 'title',
      sortDir = 'asc',
      limit = 20,
      offset = 0,
    } = req.query;

    let query = supabase
      .from('movies')
      .select('*', { count: 'exact' });

    // Apply filters
    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    // genreId would require joining movie_genres; skipping for now
    // if (genreId) {
    //   query = query.contains('genre_ids', [parseInt(genreId, 10)]);
    // }

    if (ageRating) {
      query = query.eq('age_rating', ageRating);
    }

    if (language) {
      query = query.eq('original_language', language);
    }

    if (runtimeMin) {
      query = query.gte('runtime_minutes', parseInt(runtimeMin, 10));
    }

    if (runtimeMax) {
      query = query.lte('runtime_minutes', parseInt(runtimeMax, 10));
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    // Apply sorting & pagination
    query = query
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range(parsedOffset, parsedOffset + parsedLimit - 1);

    const { data: movies, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      items: movies ?? [],
      total: count ?? 0,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (error) {
    next(error);
  }
};

// For now, only export the handler that actually exists.
module.exports = {
  getMovies,
};
