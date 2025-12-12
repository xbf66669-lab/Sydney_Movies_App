const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getPopularMoviesPaged = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`
  );
  return response.json();
};

export const getPopularMovies = async () => {
  const data = await getPopularMoviesPaged(1);
  return data.results;
};

export const getMovieDetails = async (id: string) => {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,watch/providers` 
  );
  return response.json();
};

export const getImageUrl = (path: string, size: string = 'w500') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
};