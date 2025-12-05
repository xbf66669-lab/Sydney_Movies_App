// src/components/Layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-2xl font-bold ${isActive ? 'text-blue-200' : ''}`
            }
          >
            Sydney Movies
          </NavLink>
          <div className="space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `hover:text-blue-200 ${isActive ? 'text-blue-200 font-medium' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/movies" 
              className={({ isActive }) => 
                `hover:text-blue-200 ${isActive ? 'text-blue-200 font-medium' : ''}`
              }
            >
              Movies
            </NavLink>
            <NavLink 
              to="/watchlist" 
              className={({ isActive }) => 
                `hover:text-blue-200 ${isActive ? 'text-blue-200 font-medium' : ''}`
              }
            >
              Watchlist
            </NavLink>
            <NavLink 
              to="/recommendations" 
              className={({ isActive }) => 
                `hover:text-blue-200 ${isActive ? 'text-blue-200 font-medium' : ''}`
              }
            >
              Recommendations
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `hover:text-blue-200 ${isActive ? 'text-blue-200 font-medium' : ''}`
              }
            >
              Profile
            </NavLink>
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