// client/src/pages/Profile/index.tsx
import { Outlet, NavLink } from 'react-router-dom';

// Changed from export function Profile to default export
export default function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow">
              <nav className="space-y-2">
                <NavLink 
                  to="/profile/settings" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `block px-4 py-2 rounded transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  Account Settings
                </NavLink>
                <NavLink 
                  to="/profile/preferences" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `block px-4 py-2 rounded transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  Preferences
                </NavLink>
              </nav>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}