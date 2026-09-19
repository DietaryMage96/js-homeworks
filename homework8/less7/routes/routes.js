const express = require('express');
const movieService = require('../services/service');

const router = express.Router();

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

const getMoviesHandler = asyncHandler(async (req, res) => {
  const movies = await movieService.getMovies({
    status: req.query.status,
    genre: req.query.genre,
    search: req.query.search,
  });

  res.status(200).json({
    success: true,
    data: movies,
  });
});

const getStatsHandler = asyncHandler(async (req, res) => {
  const stats = await movieService.getMovieStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

const getRecommendationsHandler = asyncHandler(async (req, res) => {
  const recommendations = await movieService.getMovieRecommendations();
  res.status(200).json({
    success: true,
    data: recommendations,
  });
});

const getExternalHandler = asyncHandler(async (req, res) => {
  const movies = await movieService.getExternalMovies(req.query.search);
  res.status(200).json({
    success: true,
    data: movies,
  });
});

const getByIdHandler = asyncHandler(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id);
  res.status(200).json({
    success: true,
    data: movie,
  });
});

const createHandler = asyncHandler(async (req, res) => {
  const movie = await movieService.createMovie(req.body);
  res.status(201).json({
    success: true,
    data: movie,
  });
});

const replaceHandler = asyncHandler(async (req, res) => {
  const movie = await movieService.replaceMovie(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: movie,
  });
});

const patchHandler = asyncHandler(async (req, res) => {
  const movie = await movieService.patchMovie(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: movie,
  });
});

const deleteHandler = asyncHandler(async (req, res) => {
  await movieService.deleteMovie(req.params.id);
  res.status(204).end();
});

// IMPORTANT: Special routes declared BEFORE /:id routes to prevent route collisions

// GET /api/movies & /api/items
router.get('/movies', getMoviesHandler);
router.get('/items', getMoviesHandler);

// GET /api/movies/stats & /api/items/stats
router.get('/movies/stats', getStatsHandler);
router.get('/items/stats', getStatsHandler);

// GET /api/movies/recommendations & /api/items/recommendations
router.get('/movies/recommendations', getRecommendationsHandler);
router.get('/items/recommendations', getRecommendationsHandler);

// GET /api/movies/external & /api/items/external
router.get('/movies/external', getExternalHandler);
router.get('/items/external', getExternalHandler);

// GET /api/movies/:id & /api/items/:id
router.get('/movies/:id', getByIdHandler);
router.get('/items/:id', getByIdHandler);

// POST /api/movies & /api/items
router.post('/movies', createHandler);
router.post('/items', createHandler);

// PUT /api/movies/:id & /api/items/:id (Full replacement)
router.put('/movies/:id', replaceHandler);
router.put('/items/:id', replaceHandler);

// PATCH /api/movies/:id & /api/items/:id (Partial update)
router.patch('/movies/:id', patchHandler);
router.patch('/items/:id', patchHandler);

// DELETE /api/movies/:id & /api/items/:id (Delete object)
router.delete('/movies/:id', deleteHandler);
router.delete('/items/:id', deleteHandler);

module.exports = router;
