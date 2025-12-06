// client/src/pages/Recommendations.tsx
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';

// Mock data - replace with real recommendations from your API
const mockRecommendations = [
  {
    id: 5,
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    genre: ["Crime", "Drama"],
    image: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    reason: "Based on your interest in crime dramas"
  },
  {
    id: 6,
    title: "Interstellar",
    year: 2014,
    rating: 8.6,
    genre: ["Adventure", "Drama", "Sci-Fi"],
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    reason: "Similar to Inception"
  },
  {
    id: 7,
    title: "Fight Club",
    year: 1999,
    rating: 8.8,
    genre: ["Drama"],
    image: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    reason: "Popular among fans of psychological thrillers"
  }
];

export default function Recommendations() {
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recommended For You</h1>
      </div>

      {mockRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No recommendations yet</h3>
          <p className="mt-1 text-sm text-gray-500">Rate more movies to get personalized recommendations.</p>
          <div className="mt-6">
            <Link
              to="/movies"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockRecommendations.map((movie) => (
            <div key={movie.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      <Link to={`/movies/${movie.id}`} className="hover:text-blue-600 hover:underline">
                        {movie.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600">{movie.year}</p>
                  </div>
                  <div className="flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {movie.rating}
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {movie.genre.map((genre, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="mt-2 text-sm text-gray-600 italic">
                  {movie.reason}
                </p>
                
                {isInWatchlist(movie.id) ? (
                  <button
                    disabled
                    className="mt-3 w-full bg-gray-100 text-gray-500 py-2 rounded-md cursor-not-allowed flex items-center justify-center"
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
          ))}
        </div>
      )}
    </div>
  );
}