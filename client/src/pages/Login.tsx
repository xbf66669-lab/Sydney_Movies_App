// client/src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setMessage('Check your email for a one-time sign-in link.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-900/65 to-indigo-950/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),rgba(15,23,42,0)_60%)]" />
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)]">
            Sydney Movies App
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="text-sm font-semibold text-slate-50 drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)]">
              Sign in to continue
            </p>
            <div className="h-8 w-8 rounded-xl bg-indigo-600/25 ring-1 ring-indigo-300/40 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="1.8"
                />
                <path
                  d="M10.5 11l4.5 2.5-4.5 2.5V11Z"
                  fill="rgba(255,255,255,0.9)"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 p-6 sm:p-8">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setError('');
                setMessage('');
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'password'
                  ? 'bg-slate-200 text-slate-900 shadow-sm ring-1 ring-slate-300'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('magic');
                setPassword('');
                setError('');
                setMessage('');
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'magic'
                  ? 'bg-slate-200 text-slate-900 shadow-sm ring-1 ring-slate-300'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Email Verification
            </button>
          </div>

          {mode === 'magic' && (
            <p className="mb-4 text-sm text-slate-600">
              We'll email you a one-time sign-in link. No password needed.
            </p>
          )}

          {message && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={mode === 'password' ? handleLogin : handleMagicLink}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {mode === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Don't have an account? Sign up
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : mode === 'password' ? 'Sign in' : 'Email me a sign-in link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}