import { Link } from 'react-router-dom';
import {
  BookmarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Browse Movies',
    description: 'Discover new and trending movies',
    icon: FilmIcon,
    path: '/browse',
    color: 'bg-blue-600',
  },
  {
    name: 'Search',
    description: 'Find specific movies anytime',
    icon: MagnifyingGlassIcon,
    path: '/search',
    color: 'bg-green-600',
  },
  {
    name: 'Watchlist',
    description: 'View and manage your saved movies',
    icon: BookmarkIcon,
    path: '/watchlist',
    color: 'bg-purple-600',
  },
  {
    name: 'Recommendations',
    description: 'Get personalized suggestions',
    icon: SparklesIcon,
    path: '/recommendations',
    color: 'bg-yellow-600',
  },
  {
    name: 'Filters',
    description: 'Narrow down what you want to watch',
    icon: FilmIcon,
    path: '/filters',
    color: 'bg-gray-600',
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-300 mb-8">Choose where you want to go next.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.path}
              className="group block p-6 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-600"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold mb-1 text-white">{feature.name}</h2>
              <p className="text-sm text-gray-300">{feature.description}</p>
              <div className="mt-4 text-sm text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                Open
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
