import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Tag, Settings, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,    label: 'Tasks' },
  { to: '/categories', icon: Tag,           label: 'Categories' },
  { to: '/settings',  icon: Settings,       label: 'Settings' },
];

const linkBase =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors';
const linkIdle =
  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50';
const linkActive =
  'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400';

export default function AppShell() {
  const { user, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex overflow-hidden">
      {/* Skip to main content — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200 dark:border-gray-800">
          <CheckSquare size={22} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-50">TaskFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
            >
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 truncate">
            {user?.email}
          </div>
          <button
            onClick={toggleTheme}
            className={`${linkBase} ${linkIdle} w-full`}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => signOut()}
            className={`${linkBase} ${linkIdle} w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300`}
          >
            <LogOut size={18} aria-hidden />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile header + drawer ───────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <CheckSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-gray-900 dark:text-gray-50">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal>
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
            <nav
              className="relative flex flex-col w-64 max-w-[80vw] bg-white dark:bg-gray-900 h-full shadow-xl"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <CheckSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-gray-900 dark:text-gray-50">TaskFlow</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-1 text-gray-500 dark:text-gray-400">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
                  >
                    <Icon size={18} aria-hidden />
                    {label}
                  </NavLink>
                ))}
              </div>
              <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
                <div className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500 truncate">
                  {user?.email}
                </div>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className={`${linkBase} ${linkIdle} w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300`}
                >
                  <LogOut size={18} aria-hidden />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page content — min-h-0 allows flex-1 to shrink below content size */}
        <main id="main-content" className="flex-1 overflow-y-auto min-h-0" tabIndex={-1}>
          <Outlet />
        </main>

        {/* Bottom tab bar — mobile only */}
        <nav
          className="lg:hidden flex border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          aria-label="Bottom navigation"
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <Icon size={20} aria-hidden />
              <span className="truncate max-w-full px-0.5 text-[10px] sm:text-xs">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
