import { useMemo } from 'react';
import type { Todo, DashboardStats } from '../types';
import { isOverdue } from '../utils/dateUtils';

// Pure derivation — no fetching. Pass the todo array from useTodos.
export function useDashboardStats(todos: Todo[]): DashboardStats {
  return useMemo(() => {
    const total     = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active    = todos.filter((t) => !t.completed).length;
    const overdue   = todos.filter((t) => isOverdue(t.due_date, t.completed)).length;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, overdue, completionPercent };
  }, [todos]);
}
