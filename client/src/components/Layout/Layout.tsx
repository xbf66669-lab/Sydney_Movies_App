// src/components/Layout/Layout.tsx
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Sydney Movies</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/movies" className="hover:text-blue-200">Movies</Link>
            <Link to="/watchlist" className="hover:text-blue-200">Watchlist</Link>
            <Link to="/discover" className="hover:text-blue-200">Discover</Link>
            <Link to="/profile" className="hover:text-blue-200">Profile</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} Sydney Movies App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}