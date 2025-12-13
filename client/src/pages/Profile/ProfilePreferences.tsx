// client/src/pages/Profile/ProfilePreferences.tsx
import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ProfilePreferences() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    newsletter: true,
    theme: theme || 'system'
  });

  // Update local state when theme changes
  useEffect(() => {
    setPreferences(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;

    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update theme immediately when changed
    if (name === 'theme') {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setTheme(value);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Save preferences to Supabase
    console.log('Saving preferences:', preferences);
    // Show success message
    alert('Preferences saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="email-notifications"
                name="emailNotifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                checked={preferences.emailNotifications}
                onChange={handleInputChange}
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Email notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                checked={preferences.newsletter}
                onChange={handleInputChange}
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Subscribe to newsletter
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Theme</h3>
          <select
            name="theme"
            value={preferences.theme}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}