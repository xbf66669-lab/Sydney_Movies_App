import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_AVATAR_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="64" fill="url(#g)"/>
  <circle cx="64" cy="52" r="22" fill="rgba(255,255,255,0.9)"/>
  <path d="M24 112c8-22 28-34 40-34s32 12 40 34" fill="rgba(255,255,255,0.9)"/>
</svg>`)} `;

const Sidebar = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [globalQuery, setGlobalQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState('');

  const profileStorageKey = useMemo(
    () => (user?.id ? `profile_settings:${user.id}` : 'profile_settings:anon'),
    [user?.id]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(profileStorageKey);
      if (!raw) {
        setAvatarDataUrl('');
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof (parsed as any).avatarDataUrl === 'string') {
        setAvatarDataUrl((parsed as any).avatarDataUrl);
        return;
      }
      setAvatarDataUrl('');
    } catch {
      setAvatarDataUrl('');
    }
  }, [profileStorageKey]);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-700' : 'hover:bg-gray-700';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalQuery.trim();
    if (!q) return;

    const normalized = q.toLowerCase().trim();
    const menuTargets: Array<{ match: (s: string) => boolean; path: string }> = [
      { match: (s) => s === 'dashboard' || s === 'home', path: '/dashboard' },
      { match: (s) => s === 'search', path: '/search' },
      { match: (s) => s === 'watchlist' || s === 'watchlists', path: '/watchlist' },
      { match: (s) => s === 'recommendations' || s === 'recommended', path: '/recommendations' },
      { match: (s) => s === 'filters' || s === 'preferences', path: '/filters' },
      { match: (s) => s === 'profile' || s === 'settings', path: '/profile/settings' },
      { match: (s) => s === 'account settings' || s === 'account', path: '/profile/settings' },
    ];

    const target = menuTargets.find((t) => t.match(normalized));
    if (target) {
      navigate(target.path);
      setMobileOpen(false);
      return;
    }

    navigate(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className={`flex items-center p-2 rounded-lg ${isActive('/dashboard') || location.pathname === '/' ? 'bg-gray-700' : ''}`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </Link>

      <Link
        to="/search"
        onClick={onNavigate}
        className={`flex items-center p-2 rounded-lg ${isActive('/search')}`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
      </Link>

      <Link
        to="/watchlist"
        onClick={onNavigate}
        className={`flex items-center p-2 rounded-lg ${isActive('/watchlist')}`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Watchlist
      </Link>

      <Link
        to="/recommendations"
        onClick={onNavigate}
        className={`flex items-center p-2 rounded-lg ${isActive('/recommendations')}`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Recommendations
      </Link>

      <Link
        to="/filters"
        onClick={onNavigate}
        className={`flex items-center p-2 rounded-lg ${isActive('/filters')}`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-4.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
      </Link>
    </>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-800 text-white border-b border-gray-700 flex items-center px-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-700"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="ml-3 font-semibold">Sydney Movies</div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h1 className="text-lg font-bold">Sydney Movies</h1>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 border-b border-gray-700">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search…"
                  />
                </div>
              </form>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>

            <div className="p-4 border-t border-gray-700">
              <Link
                to="/profile/settings"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center p-2 rounded-lg ${location.pathname.startsWith('/profile') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <img
                  src={avatarDataUrl || DEFAULT_AVATAR_DATA_URL}
                  alt="Profile"
                  className="w-6 h-6 mr-3 rounded-full object-cover"
                />
                Profile & Settings
              </Link>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="w-full flex items-center p-2 rounded-lg text-red-400 hover:bg-gray-700 mt-2"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gray-800 text-white flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Sydney Movies</h1>
        </div>

      <div className="p-4 border-b border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search…"
            />
          </div>
        </form>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <NavLinks />
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/profile/settings"
          className={`flex items-center p-2 rounded-lg ${location.pathname.startsWith('/profile') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
        >
          <img
            src={avatarDataUrl || DEFAULT_AVATAR_DATA_URL}
            alt="Profile"
            className="w-6 h-6 mr-3 rounded-full object-cover"
          />
          Profile & Settings
        </Link>
        
        <button
          onClick={signOut}
          className="w-full flex items-center p-2 rounded-lg text-red-400 hover:bg-gray-700 mt-2"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
