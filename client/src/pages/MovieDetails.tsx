// src/pages/MovieDetails.tsx
import { useParams, Link } from 'react-router-dom';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();

  // Mock data - replace with API call later
  const movie = {
    id,
    title: "Inception",
    year: 2010,
    rating: 8.8,
    duration: "2h 28m",
    genre: ["Action", "Sci-Fi", "Thriller"],
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    image: "https://via.placeholder.com/300x450"
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Link 
        to="/movies" 
        className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Back to Movies
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img 
              className="h-full w-full object-cover md:w-96" 
              src={movie.image} 
              alt={movie.title} 
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
              {movie.year} • {movie.duration}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {movie.title}
            </h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-2 text-gray-700">{movie.rating}/10</span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-gray-600">{movie.genre.join(', ')}</span>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{movie.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Director</h2>
              <p className="text-gray-700">{movie.director}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add to Watchlist
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}