// Example: src/pages/Movies.tsx
export default function Movies() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Movies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Movie cards will go here */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="h-48 bg-gray-200 mb-4 rounded"></div>
          <h3 className="font-semibold">Movie Title</h3>
          <p className="text-sm text-gray-600">2023 • Action, Adventure</p>
        </div>
      </div>
    </div>
  );
}