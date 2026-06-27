import type { Priority } from '../types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
};

// Lower number = higher priority (for sorting)
export const PRIORITY_ORDER: Record<Priority, number> = {
  high:   0,
  medium: 1,
  low:    2,
};

export function priorityBadgeClass(priority: Priority): string {
  switch (priority) {
    case 'high':   return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400';
    case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
    case 'low':    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}
