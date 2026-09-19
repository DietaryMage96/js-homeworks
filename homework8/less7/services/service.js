const repository = require('../repositories/jsonRepository');
const { validateMovie } = require('../utils/validation');

const TVMAZE_SHOWS_API = 'https://api.tvmaze.com/shows';
const TVMAZE_SEARCH_API = 'https://api.tvmaze.com/search/shows?q=';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isValidId(id) {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (!trimmed) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed);
}

/**
 * Transforms external TVMaze show object into local movie entity format.
 * Guarantees strict local entity structure matching: { name, genres, rating, year, status }
 */
function mapTvMazeShow(show) {
  const currentYear = new Date().getFullYear();
  let premieredYear = currentYear;
  if (show && show.premiered && typeof show.premiered === 'string') {
    const yearFromDate = Number(show.premiered.slice(0, 4));
    if (Number.isInteger(yearFromDate) && yearFromDate >= 1888 && yearFromDate <= 2100) {
      premieredYear = yearFromDate;
    }
  }

  let rating = 0;
  if (show && show.rating && typeof show.rating.average === 'number') {
    rating = Number(Math.min(10, Math.max(0, show.rating.average)).toFixed(1));
  }

  let genres = ['Unknown'];
  if (show && Array.isArray(show.genres) && show.genres.length > 0) {
    const cleaned = show.genres.map((g) => String(g).trim()).filter(Boolean);
    if (cleaned.length > 0) genres = cleaned;
  }

  const name = show && show.name && typeof show.name === 'string' && show.name.trim()
    ? show.name.trim()
    : 'Без назви';

  return {
    name,
    genres,
    rating,
    year: premieredYear,
    status: 'plan',
  };
}

/**
 * Service function for fetching data from an external API safely.
 * Validates HTTP status, Content-Type header, JSON payload correctness,
 * enforces a timeout via AbortController, and returns HTTP 502 on failure without crashing the server.
 */
async function fetchFromExternalApi(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw createHttpError(502, 'Час очікування відповіді від зовнішнього API вичерпано (Timeout)');
    }
    throw createHttpError(502, 'Не вдалося звернутися до зовнішнього API (Мережева помилка)');
  } finally {
    clearTimeout(timeoutId);
  }

  // 1. Validate HTTP response status
  if (!response.ok) {
    throw createHttpError(502, `Зовнішнє API повернуло помилку зі статусом ${response.status}`);
  }

  // 2. Validate Content-Type header
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw createHttpError(502, 'Зовнішнє API повернуло некоректний Content-Type (очікувався application/json)');
  }

  // 3. Validate JSON data parsing and structure
  let rawData;
  try {
    rawData = await response.json();
  } catch {
    throw createHttpError(502, 'Зовнішнє API повернуло некоректний JSON');
  }

  if (!rawData || (typeof rawData !== 'object' && !Array.isArray(rawData))) {
    throw createHttpError(502, 'Отримані дані від зовнішнього API мають некоректну структуру');
  }

  return rawData;
}

async function getMovies(filters = {}) {
  let movies = await repository.getAll();

  if (filters.status) {
    movies = movies.filter((movie) => movie.status === filters.status);
  }

  if (filters.genre) {
    const lowerGenre = filters.genre.toLowerCase();
    movies = movies.filter((movie) =>
      movie.genres.some((genre) => genre.toLowerCase() === lowerGenre)
    );
  }

  if (filters.search) {
    const lowerSearch = filters.search.toLowerCase();
    movies = movies.filter((movie) => movie.name.toLowerCase().includes(lowerSearch));
  }

  return movies;
}

async function getMovieById(id) {
  if (!isValidId(id)) {
    throw createHttpError(400, 'Некоректний формат ідентифікатора (ID)');
  }

  const movie = await repository.findById(id.trim());
  if (!movie) {
    throw createHttpError(404, 'Фільм з таким ID не знайдено');
  }

  return movie;
}

async function getMovieStats() {
  const movies = await repository.getAll();
  const watched = movies.filter((movie) => movie.status === 'watched');
  const plan = movies.filter((movie) => movie.status === 'plan');
  const ratingSum = watched.reduce((sum, movie) => sum + Number(movie.rating || 0), 0);
  const averageRating = watched.length > 0 ? ratingSum / watched.length : 0;

  return {
    totalCount: movies.length,
    watchedCount: watched.length,
    planCount: plan.length,
    averageRating: Number(averageRating.toFixed(1)),
  };
}

/**
 * Calculates high-quality movie recommendations for the user:
 * 1. Identifies favorite genre from watched movies (status === 'watched').
 * 2. Fetches popular shows from TVMaze API.
 * 3. Filters shows by favorite genre (matching actual genre tag, not text search).
 * 4. Strictly EXCLUDES any show already in the user's collection (watched or plan).
 * 5. Sorts recommendations by rating in descending order.
 */
async function getMovieRecommendations() {
  const localMovies = await repository.getAll();

  // Set of normalized names of movies already in user's list (both watched and plan)
  const existingNames = new Set(
    localMovies
      .filter((m) => m && m.name)
      .map((m) => m.name.trim().toLowerCase())
  );

  // Determine favorite genre among watched movies
  const watchedMovies = localMovies.filter((movie) => movie.status === 'watched');
  const genreCounts = {};
  for (const movie of watchedMovies) {
    if (Array.isArray(movie.genres)) {
      for (const genre of movie.genres) {
        const normalized = genre.trim();
        if (normalized) {
          genreCounts[normalized] = (genreCounts[normalized] || 0) + 1;
        }
      }
    }
  }

  let favoriteGenre = null;
  let maxCount = 0;
  for (const [genre, count] of Object.entries(genreCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteGenre = genre;
    }
  }

  // Fetch popular shows from TVMaze main list with graceful fallback
  let rawShows = [];
  try {
    rawShows = await fetchFromExternalApi(TVMAZE_SHOWS_API, 5000);
  } catch (err) {
    // If external API fails, return local plan movies
    return localMovies.filter((m) => m.status === 'plan').slice(0, 10);
  }

  if (!Array.isArray(rawShows)) {
    return localMovies.filter((m) => m.status === 'plan').slice(0, 10);
  }

  let candidateShows = rawShows;

  // Filter by favorite genre category if user has watched movies
  if (favoriteGenre) {
    const lowerFav = favoriteGenre.toLowerCase();
    const genreFiltered = rawShows.filter(
      (show) =>
        Array.isArray(show.genres) &&
        show.genres.some((g) => g.toLowerCase() === lowerFav)
    );

    if (genreFiltered.length > 0) {
      candidateShows = genreFiltered;
    }
  }

  // Filter out shows already in user's list
  const newCandidateShows = candidateShows.filter((show) => {
    const showName = show && show.name ? show.name.trim().toLowerCase() : '';
    return showName && !existingNames.has(showName);
  });

  // Sort candidate shows by rating descending
  newCandidateShows.sort((a, b) => {
    const ratingA = Number(a && a.rating && a.rating.average) || 0;
    const ratingB = Number(b && b.rating && b.rating.average) || 0;
    return ratingB - ratingA;
  });

  return newCandidateShows.slice(0, 10).map(mapTvMazeShow);
}

async function getExternalMovies(search) {
  const apiUrl = search
    ? TVMAZE_SEARCH_API + encodeURIComponent(search)
    : TVMAZE_SHOWS_API;

  const rawData = await fetchFromExternalApi(apiUrl, 5000);

  let shows = [];
  if (search) {
    if (!Array.isArray(rawData)) {
      throw createHttpError(502, 'Зовнішнє API повернуло некоректний формат результатів пошуку');
    }
    shows = rawData.map((item) => item && item.show).filter(Boolean);
  } else {
    if (!Array.isArray(rawData)) {
      throw createHttpError(502, 'Зовнішнє API повернуло некоректний список шоу');
    }
    shows = rawData;
  }

  return shows.slice(0, 10).map(mapTvMazeShow);
}

async function createMovie(body) {
  const payloadToValidate = { ...body };
  delete payloadToValidate.id;

  const result = validateMovie(payloadToValidate);
  if (result.error) {
    throw createHttpError(400, result.error);
  }

  return repository.create(result.movie);
}

async function replaceMovie(id, body) {
  if (!isValidId(id)) {
    throw createHttpError(400, 'Некоректний формат ідентифікатора (ID)');
  }

  const existingMovie = await repository.findById(id.trim());
  if (!existingMovie) {
    throw createHttpError(404, 'Фільм з таким ID не знайдено');
  }

  const payloadToValidate = { ...body };
  delete payloadToValidate.id;

  const result = validateMovie(payloadToValidate);
  if (result.error) {
    throw createHttpError(400, result.error);
  }

  const movieToSave = {
    ...result.movie,
    id: existingMovie.id,
  };

  return repository.update(id.trim(), movieToSave);
}

async function patchMovie(id, body) {
  if (!isValidId(id)) {
    throw createHttpError(400, 'Некоректний формат ідентифікатора (ID)');
  }

  const existingMovie = await repository.findById(id.trim());
  if (!existingMovie) {
    throw createHttpError(404, 'Фільм з таким ID не знайдено');
  }

  const payloadToMerge = { ...body };
  delete payloadToMerge.id;

  const merged = { ...existingMovie, ...payloadToMerge };

  const result = validateMovie(merged);
  if (result.error) {
    throw createHttpError(400, result.error);
  }

  const movieToSave = {
    ...result.movie,
    id: existingMovie.id,
  };

  return repository.update(id.trim(), movieToSave);
}

async function deleteMovie(id) {
  if (!isValidId(id)) {
    throw createHttpError(400, 'Некоректний формат ідентифікатора (ID)');
  }

  const deletedMovie = await repository.remove(id.trim());
  if (!deletedMovie) {
    throw createHttpError(404, 'Фільм з таким ID не знайдено');
  }

  return { message: 'Фільм видалено', id: id.trim() };
}

module.exports = {
  fetchFromExternalApi,
  mapTvMazeShow,
  getMovies,
  getMovieById,
  getMovieStats,
  getMovieRecommendations,
  getExternalMovies,
  createMovie,
  replaceMovie,
  patchMovie,
  updateMovie: patchMovie,
  deleteMovie,
  isValidId,
};
