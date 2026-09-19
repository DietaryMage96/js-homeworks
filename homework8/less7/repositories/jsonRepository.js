const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE_PATH = path.join(__dirname, '..', 'data', 'data.json');

// Internal queue to serialize read, modify, and write operations
let queue = Promise.resolve();

function runInQueue(task) {
  const result = queue.then(() => task());
  // Catch errors to prevent queue breakage if a task fails
  queue = result.catch(() => {});
  return result;
}

function ensureFileExistsSync() {
  const dirPath = path.dirname(FILE_PATH);
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath, { recursive: true });
  }
  if (!fsSync.existsSync(FILE_PATH)) {
    fsSync.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Ensure folder and data file exist upon module loading
ensureFileExistsSync();

async function readData() {
  ensureFileExistsSync();
  let content;
  try {
    content = await fs.readFile(FILE_PATH, 'utf-8');
  } catch (error) {
    const err = new Error('Не вдалося прочитати файл даних');
    err.statusCode = 500;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    const err = new Error('Файл data/data.json містить некоректний JSON');
    err.statusCode = 500;
    throw err;
  }

  return parsed;
}

async function getMoviesFromData() {
  const rawData = await readData();
  if (Array.isArray(rawData)) {
    return { isArray: true, movies: rawData, rawData };
  } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.movies)) {
    return { isArray: false, movies: rawData.movies, rawData };
  }

  const err = new Error('Файл data/data.json не містить правильний JSON масив');
  err.statusCode = 500;
  throw err;
}

async function writeMovies(dataInfo, newMovies) {
  ensureFileExistsSync();
  let contentToWrite;
  if (dataInfo.isArray) {
    contentToWrite = newMovies;
  } else {
    dataInfo.rawData.movies = newMovies;
    contentToWrite = dataInfo.rawData;
  }
  await fs.writeFile(FILE_PATH, JSON.stringify(contentToWrite, null, 2), 'utf-8');
}

async function getAll() {
  return runInQueue(async () => {
    const { movies } = await getMoviesFromData();
    return movies;
  });
}

async function findById(id) {
  return runInQueue(async () => {
    const { movies } = await getMoviesFromData();
    return movies.find((movie) => movie.id === id) || null;
  });
}

async function create(movieData) {
  return runInQueue(async () => {
    const dataInfo = await getMoviesFromData();
    const newMovie = {
      id: crypto.randomUUID(),
      ...movieData,
    };
    dataInfo.movies.push(newMovie);
    await writeMovies(dataInfo, dataInfo.movies);
    return newMovie;
  });
}

async function update(id, movieData) {
  return runInQueue(async () => {
    const dataInfo = await getMoviesFromData();
    const index = dataInfo.movies.findIndex((movie) => movie.id === id);
    if (index === -1) {
      return null;
    }
    const updatedMovie = {
      ...dataInfo.movies[index],
      ...movieData,
      id,
    };
    dataInfo.movies[index] = updatedMovie;
    await writeMovies(dataInfo, dataInfo.movies);
    return updatedMovie;
  });
}

async function remove(id) {
  return runInQueue(async () => {
    const dataInfo = await getMoviesFromData();
    const index = dataInfo.movies.findIndex((movie) => movie.id === id);
    if (index === -1) {
      return null;
    }
    const [removedMovie] = dataInfo.movies.splice(index, 1);
    await writeMovies(dataInfo, dataInfo.movies);
    return removedMovie;
  });
}

module.exports = {
  getAll,
  findById,
  create,
  update,
  remove,
};
