// api/src/routes/movies.js

const express = require('express');
const router = express.Router();

// We can plug auth later when JWTs are ready:
// const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');

// If you want to enforce auth later, uncomment this:
// router.use(authenticateJWT);

// GET /api/v1/movies - List & search movies
router.get('/', getMovies);

// GET /api/v1/movies/:movieId - Get movie by ID
router.get('/:movieId', getMovieById);

// POST /api/v1/movies - Create a new movie
router.post('/', validate('createMovie'), createMovie);

// PATCH /api/v1/movies/:movieId - Update a movie
router.patch('/:movieId', validate('updateMovie'), updateMovie);

// DELETE /api/v1/movies/:movieId - Delete a movie
router.delete('/:movieId', deleteMovie);

module.exports = router;
