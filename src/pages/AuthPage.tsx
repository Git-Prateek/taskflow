import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckSquare, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type AuthTab = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  function switchTab(next: AuthTab) {
    setTab(next);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (tab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (tab === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    if (tab === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else if (tab === 'signup') {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setSuccessMsg('Account created! Check your email to confirm your address, then sign in.');
    } else {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setSuccessMsg('Password reset email sent. Check your inbox.');
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Theme toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <CheckSquare size={32} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">TaskFlow</span>
          </div>

          {/* Tabs */}
          {tab !== 'reset' && (
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6" role="tablist">
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                    tab === t
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              {tab === 'login' && 'Welcome back'}
              {tab === 'signup' && 'Create your account'}
              {tab === 'reset' && 'Reset your password'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tab === 'login' && 'Sign in to your TaskFlow account'}
              {tab === 'signup' && 'Start managing your tasks for free'}
              {tab === 'reset' && "We'll send you a reset link"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-colors"
              />
            </div>

            {tab !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {tab === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-colors"
                />
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}
            {successMsg && (
              <div role="status" className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {tab === 'login' && 'Sign In'}
              {tab === 'signup' && 'Create Account'}
              {tab === 'reset' && 'Send Reset Email'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
            {tab === 'login' && (
              <button onClick={() => switchTab('reset')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Forgot your password?
              </button>
            )}
            {tab === 'reset' && (
              <button onClick={() => switchTab('login')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
    </div>
  );
}
