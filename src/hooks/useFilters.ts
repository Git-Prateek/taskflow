import { useState, useMemo } from 'react';
import type { FilterState, Todo, Priority } from '../types';
import { isOverdue } from '../utils/dateUtils';
import { PRIORITY_ORDER } from '../utils/priorityUtils';

export const DEFAULT_FILTERS: FilterState = {
  search:     '',
  status:     'all',
  priority:   'all',
  categoryId: 'all',
  sort:       'newest',
};

export function useFilters(todos: Todo[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const filtered = useMemo(() => {
    let result = [...todos];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
      );
    }

    switch (filters.status) {
      case 'active':    result = result.filter((t) => !t.completed); break;
      case 'completed': result = result.filter((t) => t.completed);  break;
      case 'overdue':   result = result.filter((t) => isOverdue(t.due_date, t.completed)); break;
    }

    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === (filters.priority as Priority));
    }

    if (filters.categoryId !== 'all') {
      result = result.filter((t) => t.category_id === filters.categoryId);
    }

    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => a.created_at.localeCompare(b.created_at));
        break;
      case 'due_date':
        result.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        });
        break;
      case 'priority':
        result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [todos, filters]);

  const activeFilterCount = [
    filters.status     !== 'all' ? 1 : 0,
    filters.priority   !== 'all' ? 1 : 0,
    filters.categoryId !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return { filters, filtered, updateFilter, resetFilters, activeFilterCount };
}
