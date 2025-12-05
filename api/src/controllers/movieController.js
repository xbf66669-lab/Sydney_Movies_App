// api/src/controllers/movieController.js

const supabase = require('../config/supabase');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/**
 * GET /movies
 * List & search movies with filters + pagination.
 */
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

/**
 * GET /movies/:movieId
 * Get details for a single movie by ID.
 */
const getMovieById = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (Number.isNaN(movieId)) {
      throw new BadRequestError('movieId must be a number');
    }

    const { data: movie, error } = await supabase
      .from('movies')
      .select('*')
      .eq('movie_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "Results contain 0 rows" in PostgREST
      throw error;
    }

    if (!movie) {
      throw new NotFoundError('Movie not found');
    }

    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /movies
 * Create a new movie.
 */
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      release_year,
      age_rating,
      runtime_minutes,
      original_language,
      poster_url,
    } = req.body;

    if (!title) {
      throw new BadRequestError('title is required');
    }

    const { data, error } = await supabase
      .from('movies')
      .insert([
        {
          title,
          release_year,
          age_rating,
          runtime_minutes,
          original_language,
          poster_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /movies/:movieId
 * Update an existing movie (partial update).
 */
const updateMovie = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (Number.isNaN(movieId)) {
      throw new BadRequestError('movieId must be a number');
    }

    const updateFields = req.body || {};

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError('No fields provided to update');
    }

    const { data, error } = await supabase
      .from('movies')
      .update(updateFields)
      .eq('movie_id', movieId)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      throw new NotFoundError('Movie not found');
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /movies/:movieId
 * Delete a movie by ID.
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (Number.isNaN(movieId)) {
      throw new BadRequestError('movieId must be a number');
    }

    const { data, error } = await supabase
      .from('movies')
      .delete()
      .eq('movie_id', movieId)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      throw new NotFoundError('Movie not found');
    }

    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
