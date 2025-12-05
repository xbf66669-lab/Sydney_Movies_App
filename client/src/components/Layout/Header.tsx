// client/src/components/Layout/Header.tsx
import { NavLink } from 'react-router-dom';

const linkBaseClasses = 'hover:text-blue-300';

export function Header() {
  return (
    <header className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sydney Movies</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? `${linkBaseClasses} active` : linkBaseClasses
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/movies"
                className={({ isActive }) =>
                  isActive ? `${linkBaseClasses} active` : linkBaseClasses
                }
              >
                Movies
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/watchlist"
                className={({ isActive }) =>
                  isActive ? `${linkBaseClasses} active` : linkBaseClasses
                }
              >
                My Watchlist
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  isActive ? `${linkBaseClasses} active` : linkBaseClasses
                }
              >
                Discover
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/recommendations"
                className={({ isActive }) =>
                  isActive ? `${linkBaseClasses} active` : linkBaseClasses
                }
              >
                For You
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? `${linkBaseClasses} active` : linkBaseClasses
                }
              >
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
