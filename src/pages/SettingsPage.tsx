import { Sun, Moon, Monitor, LogOut, User } from 'lucide-react';
import { useTheme }  from '../contexts/ThemeContext';
import { useAuth }   from '../contexts/AuthContext';
import { useToast }  from '../contexts/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Button        from '../components/ui/Button';
import type { Theme } from '../types';

interface ThemeOptionProps {
  value: Theme;
  current: Theme;
  icon: React.ReactNode;
  label: string;
  description: string;
  preview: React.ReactNode;
  onSelect: (t: Theme) => void;
}

function ThemeOption({ value, current, icon, label, description, preview, onSelect }: ThemeOptionProps) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={`flex-1 flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-left ${
        active
          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
      }`}
    >
      {/* Mini preview swatch */}
      <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-16 shrink-0">
        {preview}
      </div>
      <div className="flex items-center gap-2">
        <span className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}>
          {icon}
        </span>
        <div>
          <p className={`text-sm font-medium ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-50'}`}>
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
          active
            ? 'border-indigo-500 dark:border-indigo-400'
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          {active && <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />}
        </div>
      </div>
    </button>
  );
}

const LightPreview = () => (
  <div className="h-full bg-gray-50 flex flex-col p-2 gap-1.5">
    <div className="h-2 w-1/2 bg-gray-300 rounded" />
    <div className="flex gap-1.5 flex-1">
      <div className="w-8 bg-white rounded border border-gray-200" />
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-3 bg-white rounded border border-gray-200" />
        <div className="h-3 bg-white rounded border border-gray-200 w-4/5" />
      </div>
    </div>
  </div>
);

const DarkPreview = () => (
  <div className="h-full bg-gray-950 flex flex-col p-2 gap-1.5">
    <div className="h-2 w-1/2 bg-gray-700 rounded" />
    <div className="flex gap-1.5 flex-1">
      <div className="w-8 bg-gray-900 rounded border border-gray-800" />
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-3 bg-gray-900 rounded border border-gray-800" />
        <div className="h-3 bg-gray-900 rounded border border-gray-800 w-4/5" />
      </div>
    </div>
  </div>
);

const SystemPreview = () => (
  <div className="h-full flex">
    <div className="flex-1 bg-gray-50 flex flex-col p-2 gap-1.5">
      <div className="h-2 w-3/4 bg-gray-300 rounded" />
      <div className="flex-1 bg-white rounded border border-gray-200" />
    </div>
    <div className="flex-1 bg-gray-950 flex flex-col p-2 gap-1.5">
      <div className="h-2 w-3/4 bg-gray-700 rounded" />
      <div className="flex-1 bg-gray-900 rounded border border-gray-800" />
    </div>
  </div>
);

const SECTION = 'rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden';
const SECTION_HEADER = 'px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut }   = useAuth();
  const { addToast }        = useToast();
  useDocumentTitle('Settings');

  async function handleSignOut() {
    await signOut();
    addToast('Signed out successfully');
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 sm:py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your preferences</p>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 space-y-6 max-w-2xl w-full mx-auto">

        {/* ── Appearance ────────────────────────────────── */}
        <section aria-labelledby="appearance-heading">
          <div className={SECTION}>
            <div className={SECTION_HEADER}>
              <h2 id="appearance-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Appearance
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Choose how TaskFlow looks on this device.
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <ThemeOption
                  value="light"
                  current={theme}
                  icon={<Sun size={16} />}
                  label="Light"
                  description="Always light"
                  preview={<LightPreview />}
                  onSelect={setTheme}
                />
                <ThemeOption
                  value="dark"
                  current={theme}
                  icon={<Moon size={16} />}
                  label="Dark"
                  description="Always dark"
                  preview={<DarkPreview />}
                  onSelect={setTheme}
                />
                <ThemeOption
                  value="system"
                  current={theme}
                  icon={<Monitor size={16} />}
                  label="System"
                  description="Follows your OS"
                  preview={<SystemPreview />}
                  onSelect={setTheme}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                Your preference is saved locally and applied on every visit.
              </p>
            </div>
          </div>
        </section>

        {/* ── Account ───────────────────────────────────── */}
        <section aria-labelledby="account-heading">
          <div className={SECTION}>
            <div className={SECTION_HEADER}>
              <h2 id="account-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Account
              </h2>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                  <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Free plan</p>
                </div>
              </div>
              <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<LogOut size={14} />}
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── About ─────────────────────────────────────── */}
        <section aria-labelledby="about-heading">
          <div className={SECTION}>
            <div className={SECTION_HEADER}>
              <h2 id="about-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                About
              </h2>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {[
                ['App',       'TaskFlow v1.0.0'],
                ['Stack',     'React 19 · TypeScript · Tailwind CSS v4'],
                ['Database',  'Supabase (PostgreSQL + RLS)'],
                ['Hosting',   'Netlify (free tier)'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
                  <span className="text-gray-900 dark:text-gray-100 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
