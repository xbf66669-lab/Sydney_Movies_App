// src/pages/Home.tsx
export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Welcome to Sydney Movies</h1>
      <p className="text-lg mb-6">
        Discover and track your favorite movies. Create watchlists and get personalized recommendations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured movies will go here */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Featured Movies</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}