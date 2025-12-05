// client/src/pages/Discover/index.tsx
export function Discover() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Discover Movies</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          {/* Filter components will go here */}
        </div>
        <div className="md:col-span-3">
          {/* Movie grid will go here */}
          <p>Use filters to discover movies that match your preferences.</p>
        </div>
      </div>
    </div>
  );
}