const express = require('express');
const router = express.Router();

// We’ll leave auth in place for later, but not enforce it for now:
// const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { getMovies } = require('../controllers/movieController');

// If you want to require auth later, uncomment this:
// router.use(authenticateJWT);

// GET /api/v1/movies - List & search movies
router.get('/', getMovies);

// The rest of these will be wired up once the controller methods exist:
//
// // GET /api/v1/movies/:id - Get movie by ID
// router.get('/:id', movieController.getMovieById);
//
// // POST /api/v1/movies - Create a new movie (admin)
// router.post(
//   '/',
//   validate('createMovie'),
//   movieController.createMovie
// );
//
// // PUT /api/v1/movies/:id - Update a movie (admin)
// router.put(
//   '/:id',
//   validate('updateMovie'),
//   movieController.updateMovie
// );
//
// // DELETE /api/v1/movies/:id - Delete a movie (admin)
// router.delete('/:id', movieController.deleteMovie);

module.exports = router;
