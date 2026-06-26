import { Link } from 'react-router-dom';
import {
  CheckSquare, ListTodo, CheckCircle2, AlertTriangle, Plus, ArrowRight, Calendar,
} from 'lucide-react';
import { useTodos }           from '../hooks/useTodos';
import { useDashboardStats }  from '../hooks/useDashboardStats';
import { useAuth }            from '../contexts/AuthContext';
import { useDocumentTitle }   from '../hooks/useDocumentTitle';
import StatsCard              from '../components/dashboard/StatsCard';
import ProgressRing           from '../components/dashboard/ProgressRing';
import SkeletonCard           from '../components/common/SkeletonCard';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { priorityBadgeClass, PRIORITY_LABELS } from '../utils/priorityUtils';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user }   = useAuth();
  const { todos, loading } = useTodos();
  const stats      = useDashboardStats(todos);
  useDocumentTitle('Dashboard');

  const displayName = user?.email?.split('@')[0] ?? 'there';

  // Last 5 incomplete tasks sorted by created_at desc
  const recentActive = todos
    .filter((t) => !t.completed)
    .slice(0, 5);

  // Overdue tasks
  const overdueTasks = todos.filter((t) => isOverdue(t.due_date, t.completed));

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-5 sm:py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">{greeting()},</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-0.5 capitalize">
          {displayName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {loading
            ? 'Loading your overview…'
            : stats.total === 0
            ? 'No tasks yet — create one to get started.'
            : `You have ${stats.active} active task${stats.active !== 1 ? 's' : ''}${stats.overdue > 0 ? ` and ${stats.overdue} overdue` : ''}.`
          }
        </p>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-5xl w-full mx-auto">

        {/* ── Stats grid ────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard
              label="Total tasks"
              value={stats.total}
              icon={<ListTodo size={18} />}
              accent="text-indigo-600 dark:text-indigo-400"
              bg="bg-indigo-50 dark:bg-indigo-950/50"
            />
            <StatsCard
              label="Active"
              value={stats.active}
              icon={<CheckSquare size={18} />}
              accent="text-blue-600 dark:text-blue-400"
              bg="bg-blue-50 dark:bg-blue-950/50"
            />
            <StatsCard
              label="Completed"
              value={stats.completed}
              icon={<CheckCircle2 size={18} />}
              accent="text-green-600 dark:text-green-400"
              bg="bg-green-50 dark:bg-green-950/50"
            />
            <StatsCard
              label="Overdue"
              value={stats.overdue}
              icon={<AlertTriangle size={18} />}
              accent={stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}
              bg={stats.overdue > 0 ? 'bg-red-50 dark:bg-red-950/50' : 'bg-gray-100 dark:bg-gray-800'}
            />
          </div>
        )}

        {/* ── Progress + Breakdown ─────────────────────── */}
        {!loading && stats.total > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ring */}
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {/* Render ring smaller on narrow screens */}
              <div className="block sm:hidden"><ProgressRing percent={stats.completionPercent} size={110} /></div>
              <div className="hidden sm:block"><ProgressRing percent={stats.completionPercent} size={140} /></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {stats.completed} of {stats.total} task{stats.total !== 1 ? 's' : ''} completed
              </p>
            </div>

            {/* Breakdown bars */}
            <div className="flex flex-col justify-center gap-4 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Breakdown</h2>
              {[
                { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
                { label: 'Active',    value: stats.active,    color: 'bg-indigo-500' },
                { label: 'Overdue',   value: stats.overdue,   color: 'bg-red-500'   },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{label}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {value} ({stats.total > 0 ? Math.round((value / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-500`}
                      style={{ width: stats.total > 0 ? `${(value / stats.total) * 100}%` : '0%' }}
                      role="progressbar"
                      aria-valuenow={value}
                      aria-valuemax={stats.total}
                      aria-label={label}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Overdue alert ────────────────────────────── */}
        {!loading && overdueTasks.length > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
                </p>
                <ul className="mt-2 space-y-1">
                  {overdueTasks.slice(0, 3).map((t) => (
                    <li key={t.id} className="text-sm text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" aria-hidden />
                      <span className="truncate">{t.title}</span>
                      {t.due_date && (
                        <span className="shrink-0 text-xs opacity-70">· {formatDate(t.due_date)}</span>
                      )}
                    </li>
                  ))}
                  {overdueTasks.length > 3 && (
                    <li className="text-xs text-red-600 dark:text-red-400 opacity-70">
                      +{overdueTasks.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
              <Link
                to="/tasks"
                className="shrink-0 text-xs font-medium text-red-700 dark:text-red-400 hover:underline"
              >
                View all
              </Link>
            </div>
          </div>
        )}

        {/* ── Recent active tasks ───────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : recentActive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <CheckSquare size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {stats.total === 0 ? 'No tasks yet' : 'All tasks complete!'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total === 0
                  ? 'Create your first task to get started.'
                  : 'Great work — nothing left to do.'}
              </p>
              {stats.total === 0 && (
                <Link
                  to="/tasks"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus size={14} /> New Task
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {recentActive.map((todo) => {
                const overdue   = isOverdue(todo.due_date, todo.completed);
                const dateLabel = formatDate(todo.due_date);
                return (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                        {todo.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${priorityBadgeClass(todo.priority)}`}>
                          {PRIORITY_LABELS[todo.priority]}
                        </span>
                        {todo.category && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: todo.category.color }} aria-hidden />
                            {todo.category.name}
                          </span>
                        )}
                        {dateLabel && (
                          <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                            <Calendar size={10} aria-hidden />
                            {overdue ? `Overdue · ${dateLabel}` : dateLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {todos.filter((t) => !t.completed).length > 5 && (
                <Link
                  to="/tasks"
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View {todos.filter((t) => !t.completed).length - 5} more <ArrowRight size={13} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Quick action when no tasks ─────────────────── */}
        {!loading && stats.total === 0 && (
          <Link
            to="/tasks"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <Plus size={16} /> Create your first task
          </Link>
        )}

      </div>
    </div>
  );
}
