// src/pages/Discover.tsx
export default function Discover() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Discover Movies</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search movies..."
          className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Discover results will go here */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="h-48 bg-gray-200 mb-4 rounded"></div>
          <h3 className="font-semibold">Movie Title</h3>
          <p className="text-sm text-gray-600 mb-2">2023 • Action, Adventure</p>
          <button className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm">
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}