import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPopularMovies } from '../api/tmdb';
import { 
  MagnifyingGlassIcon,
  BookmarkIcon,
  PlayCircleIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const getPosterFallbackDataUrl = (title: string) => {
  const safeTitle = (title || 'No Image').slice(0, 40);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="#111827"/>
  <rect x="16" y="16" width="268" height="418" rx="16" fill="#1f2937"/>
  <text x="150" y="225" text-anchor="middle" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="16">
    <tspan x="150" dy="0">${safeTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>
  </text>
  <text x="150" y="255" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">No poster available</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const data = await getPopularMovies();
        if (data && Array.isArray(data)) {
          setTrendingMovies(data.slice(0, 6));
        } else if (data?.results) {
          setTrendingMovies(data.results.slice(0, 6));
        } else {
          console.error('Unexpected data format:', data);
          setTrendingMovies([]);
        }
      } catch (error) {
        console.error('Error fetching trending movies:', error);
        setTrendingMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingMovies();
  }, []);

  const features = [
    {
      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
      title: "Discover Movies",
      description: "Find new and trending movies tailored to your taste."
    },
    {
      icon: <BookmarkIcon className="w-6 h-6" />,
      title: "Save to Watchlist",
      description: "Keep track of movies you want to watch later."
    },
    {
      icon: <PlayCircleIcon className="w-6 h-6" />,
      title: "Watch Trailers",
      description: "Watch trailers and get more details about your favorite movies."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Discover Your Next</span>
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Favorite Movie
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
              Explore thousands of movies, track what you've watched, and save your favorites to your watchlist.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/browse"
                className="px-8 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Browse All Movies
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/watchlist"
                className="px-8 py-3.5 border-2 border-gray-600 text-base font-semibold rounded-xl text-white bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                View My Watchlist
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Now Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mr-3"></span>
            Trending Now
          </h2>
          <Link 
            to="/browse" 
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium mt-2 sm:mt-0 inline-flex items-center"
          >
            View All
            <ArrowRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800/50 rounded-xl animate-pulse">
                <div className="w-full h-full bg-gray-700/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {trendingMovies.map((movie) => (
              <div 
                key={movie.id}
                className="group relative overflow-hidden rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
              >
                <Link to={`/movies/${movie.id}`} className="block">
                  <div className="aspect-[2/3] w-full overflow-hidden">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                          : getPosterFallbackDataUrl(movie.title)
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = getPosterFallbackDataUrl(movie.title);
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-white line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
                      <div className="flex items-center bg-gray-800/80 px-2 py-1 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 mt-2 line-clamp-2">{movie.overview}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-800/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Us</h2>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
              The best way to discover, track, and enjoy your favorite movies
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/30 p-6 rounded-2xl hover:bg-gray-700/30 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <div className="text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-center text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600/90 to-purple-600/90 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://tailwindui.com/img/beams/bottom.svg')] bg-[length:150%] bg-bottom opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Start exploring movies today.</span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/browse"
              className="px-8 py-3.5 border border-transparent text-base font-medium rounded-xl text-blue-700 bg-white hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              Browse Movies
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 border-2 border-white/20 text-base font-medium rounded-xl text-white hover:bg-white/10 transition-colors duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}