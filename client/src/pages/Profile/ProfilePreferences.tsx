// client/src/pages/Profile/ProfilePreferences.tsx
export default function ProfilePreferences() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Preferences</h2>
      <form className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="email-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                Email notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="newsletter"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                Subscribe to newsletter
              </label>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Theme</h3>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            defaultValue="system"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
}