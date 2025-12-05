// src/pages/Watchlist.tsx
export default function Watchlist() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Watchlist items will go here */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="h-48 bg-gray-200 mb-4 rounded"></div>
          <h3 className="font-semibold">Movie Title</h3>
          <p className="text-sm text-gray-600">2023 • Action, Adventure</p>
          <div className="mt-2 flex space-x-2">
            <button className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}