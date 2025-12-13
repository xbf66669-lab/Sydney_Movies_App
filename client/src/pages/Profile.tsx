// client/src/pages/Profile.tsx
import { Link, Outlet } from 'react-router-dom';

export default function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow">
              <nav className="space-y-2">
                <Link 
                  to="/profile/settings" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Account Settings
                </Link>
                <Link
                  to="/profile/comments"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Recent Comments
                </Link>
                <Link 
                  to="/filters" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Filters
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}