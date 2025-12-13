// client/src/pages/Profile/ProfileSettings.tsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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

export default function ProfileSettings() {
  const { user } = useAuth();
  const storageKey = useMemo(() => (user?.id ? `profile_settings:${user.id}` : 'profile_settings:anon'), [user?.id]);

  const [displayName, setDisplayName] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');
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
        if (typeof (parsed as any).avatarDataUrl === 'string') setAvatarDataUrl((parsed as any).avatarDataUrl);
      }
    } catch {
    }
  }, [storageKey]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ displayName: displayName.trim(), avatarDataUrl }));
      setMessage('Profile updated.');
    } catch {
      setError('Failed to save profile.');
    }
  };

  const handleAvatarFile = async (file: File | null) => {
    setMessage(null);
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image.'));
        reader.readAsDataURL(file);
      });
      if (!dataUrl) {
        setError('Failed to load image preview.');
        return;
      }
      setAvatarDataUrl(dataUrl);
    } catch (e: any) {
      console.error(e);
      setError(typeof e?.message === 'string' ? e.message : 'Failed to load image.');
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
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Account Settings</h2>
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
                <img
                  src={avatarDataUrl || DEFAULT_AVATAR_DATA_URL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.currentTarget.files && e.currentTarget.files.length ? e.currentTarget.files[0] : null;
                  void handleAvatarFile(f);
                }}
                className="mt-1 block w-full text-sm text-gray-700"
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