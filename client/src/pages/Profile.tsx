// src/pages/Profile.tsx
export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
            👤
          </div>
          <div>
            <h2 className="text-xl font-semibold">User Name</h2>
            <p className="text-gray-600">user@example.com</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Account Settings</h3>
            <div className="mt-2 space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded">
                Edit Profile
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded">
                Change Password
              </button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-gray-700">Preferences</h3>
            <div className="mt-2 space-y-2">
              <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <input type="checkbox" className="rounded" />
                <span>Email notifications</span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button className="text-red-600 hover:text-red-800">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}