// client/src/pages/Movies/index.tsx
import { useState } from 'react';
import { MovieList } from './MovieList';

export function Movies() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Movies</h1>
        <input
          type="text"
          placeholder="Search movies..."
          className="p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <MovieList searchQuery={searchQuery} />
    </div>
  );
}