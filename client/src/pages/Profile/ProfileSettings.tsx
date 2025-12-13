// client/src/pages/Profile/ProfileSettings.tsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProfileSettings() {
  const { user } = useAuth();
  const storageKey = useMemo(() => (user?.id ? `profile_settings:${user.id}` : 'profile_settings:anon'), [user?.id]);

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (typeof (parsed as any).displayName === 'string') setDisplayName((parsed as any).displayName);
        if (typeof (parsed as any).avatarUrl === 'string') setAvatarUrl((parsed as any).avatarUrl);
      }
    } catch {
    }
  }, [storageKey]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ displayName: displayName.trim(), avatarUrl: avatarUrl.trim() }));
      setMessage('Profile updated.');
    } catch {
      setError('Failed to save profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const password = newPassword.trim();
    if (!password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSaving(true);
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      setNewPassword('');
      setMessage('Password updated.');
    } catch (e: any) {
      console.error(e);
      setError(typeof e?.message === 'string' ? e.message : 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
      <p className="text-sm text-gray-600 mb-6">Manage your account details.</p>

      {!user ? (
        <div className="text-sm text-gray-600">Please sign in to manage your account.</div>
      ) : (
        <div className="space-y-8">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Customize Profile</h3>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-green-700">{message}</div>}

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">Avatar</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Save Profile
            </button>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account</h3>
            <div className="text-sm text-gray-700">
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-green-700">{message}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}