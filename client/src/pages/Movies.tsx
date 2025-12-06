// client/src/pages/Movies.tsx
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useEffect, useState } from 'react';
import { getPopularMovies, getImageUrl } from '../api/tmdb';

export default function Movies() {
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getPopularMovies();
        // Transform the API data to match your expected format
        const formattedMovies = data.map(movie => ({
          id: movie.id,
          title: movie.title,
          year: new Date(movie.release_date).getFullYear(),
          rating: movie.vote_average,
          genre: movie.genre_ids.map(id => {
            // Map genre IDs to names (you might want to fetch this from the API)
            const genres = {
              28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
              80: 'Crime', 18: 'Drama', 10751: 'Family', 14: 'Fantasy',
              36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery',
              10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'War'
            };
            return genres[id] || 'Unknown';
          }),
          image: getImageUrl(movie.poster_path)
        }));
        setMovies(formattedMovies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>Error loading movies: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Movies</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <div className="relative pb-[150%] bg-gray-100">
                <Link to={`/movies/${movie.id}`}>
                  <img 
                    src={movie.image} 
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title)}`;
                    }}
                  />
                </Link>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2">
                  <Link to={`/movies/${movie.id}`} className="hover:underline">
                    {movie.title}
                  </Link>
                </h3>
                <div className="flex items-center justify-between mt-auto text-sm text-gray-600">
                  <span>{movie.year}</span>
                  <div className="flex items-center">
                    <svg 
                      className="w-4 h-4 text-yellow-400 mr-1" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {movie.genre.slice(0, 2).map((genre, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                {isInWatchlist(movie.id) ? (
                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    className="mt-3 w-full bg-red-100 text-red-700 py-2 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    In Watchlist
                  </button>
                ) : (
                  <button
                    onClick={() => addToWatchlist({
                      id: movie.id,
                      title: movie.title,
                      year: movie.year,
                      rating: movie.rating,
                      genre: movie.genre,
                      image: movie.image
                    })}
                    className="mt-3 w-full bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                      />
                    </svg>
                    Add to Watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}