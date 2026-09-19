function normalizeGenres(value) {
  if (Array.isArray(value)) {
    return value.map((genre) => String(genre).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((genre) => genre.trim()).filter(Boolean);
  }

  return [];
}

function isValidDateFormat(dateString) {
  if (typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
}

function validateMovie(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return {
      error: 'Тіло запиту повинно бути об’єктом',
      errors: ['Тіло запиту повинно бути об’єктом'],
    };
  }

  // 1. Validate name
  if (body.name === undefined || body.name === null) {
    errors.push("Поле 'name' є обов'язковим");
  } else if (typeof body.name !== 'string') {
    errors.push("Поле 'name' повинно бути рядком");
  } else if (body.name.trim() === '') {
    errors.push("Поле 'name' не може бути порожнім рядком");
  }

  // 2. Validate genres
  if (body.genres === undefined || body.genres === null) {
    errors.push("Поле 'genres' є обов'язковим");
  } else {
    const genres = normalizeGenres(body.genres);
    if (genres.length === 0) {
      errors.push("Поле 'genres' повинно містити щонайменше один непорожній жанр");
    }
  }

  // 3. Validate rating
  if (body.rating === undefined || body.rating === null || body.rating === '') {
    errors.push("Поле 'rating' є обов'язковим");
  } else {
    const ratingNum = Number(body.rating);
    if (typeof body.rating === 'boolean' || isNaN(ratingNum) || !Number.isFinite(ratingNum)) {
      errors.push("Поле 'rating' повинно бути числовим значенням");
    } else if (ratingNum < 0 || ratingNum > 10) {
      errors.push("Поле 'rating' повинно бути числом у межах від 0 до 10");
    }
  }

  // 4. Validate year and/or releaseDate format
  if (body.year === undefined || body.year === null || body.year === '') {
    if (!body.releaseDate) {
      errors.push("Поле 'year' є обов'язковим");
    }
  } else {
    const yearNum = Number(body.year);
    if (typeof body.year === 'boolean' || !Number.isInteger(yearNum)) {
      errors.push("Поле 'year' повинно бути цілим числом");
    } else if (yearNum < 1888 || yearNum > 2100) {
      errors.push("Поле 'year' повинно бути роком у межах від 1888 до 2100");
    }
  }

  if (body.releaseDate !== undefined && body.releaseDate !== null && body.releaseDate !== '') {
    if (!isValidDateFormat(body.releaseDate)) {
      errors.push("Поле 'releaseDate' повинно мати коректний формат дати YYYY-MM-DD");
    }
  }

  // 5. Validate status
  if (body.status === undefined || body.status === null || body.status === '') {
    errors.push("Поле 'status' є обов'язковим");
  } else if (typeof body.status !== 'string') {
    errors.push("Поле 'status' повинно бути рядком");
  } else {
    const allowedStatuses = ['plan', 'watched'];
    if (!allowedStatuses.includes(body.status.trim())) {
      errors.push("Поле 'status' повинно мати одне з допустимих значень: 'plan' або 'watched'");
    }
  }

  if (errors.length > 0) {
    return {
      error: errors.join('; '),
      errors,
    };
  }

  const movie = {
    name: body.name.trim(),
    genres: normalizeGenres(body.genres),
    rating: Number(body.rating),
    year: Number(body.year),
    status: body.status.trim(),
  };

  if (body.releaseDate && isValidDateFormat(body.releaseDate)) {
    movie.releaseDate = body.releaseDate;
  }

  return { movie };
}

module.exports = {
  normalizeGenres,
  isValidDateFormat,
  validateMovie,
};
