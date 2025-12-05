// src/pages/Recommendations.tsx
import { useState, useEffect } from 'react';

export default function Recommendations() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Recommendations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recommendation items will go here */}
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="h-48 bg-gray-200 mb-4 rounded"></div>
          <h3 className="font-semibold">Recommended Movie</h3>
          <p className="text-sm text-gray-600">2023 • Based on your watch history</p>
          <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm">
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}