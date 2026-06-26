import { useState } from 'react';
import {
  Plus, Search, SlidersHorizontal, RotateCcw, CheckSquare,
} from 'lucide-react';
import { useTodos }      from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { useFilters }    from '../hooks/useFilters';
import { useToast }      from '../contexts/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Modal             from '../components/ui/Modal';
import Button            from '../components/ui/Button';
import TodoCard          from '../components/todos/TodoCard';
import TodoForm          from '../components/todos/TodoForm';
import EmptyState        from '../components/common/EmptyState';
import SkeletonCard      from '../components/common/SkeletonCard';
import type { Todo, TodoFormData, FilterStatus, SortOption, Priority } from '../types';

const SELECT =
  'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ' +
  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ' +
  'text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors';

export default function TasksPage() {
  const { todos, loading, error, createTodo, updateTodo, toggleComplete, deleteTodo } = useTodos();
  const { categories } = useCategories();
  const { filters, filtered, updateFilter, resetFilters, activeFilterCount } = useFilters(todos);
  const { addToast } = useToast();
  useDocumentTitle('Tasks');

  const [formOpen,      setFormOpen]      = useState(false);
  const [editTodo,      setEditTodo]      = useState<Todo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Todo | null>(null);
  const [filterOpen,    setFilterOpen]    = useState(false);

  async function handleCreate(data: TodoFormData) {
    await createTodo(data);
    setFormOpen(false);
    addToast('Task created');
  }

  async function handleUpdate(data: TodoFormData) {
    if (!editTodo) return;
    await updateTodo(editTodo.id, data);
    setEditTodo(null);
    addToast('Task updated');
  }

  async function handleToggle(todo: Todo) {
    try {
      await toggleComplete(todo.id, !todo.completed);
      addToast(todo.completed ? 'Task marked as active' : 'Task completed');
    } catch {
      addToast('Failed to update task', 'error');
    }
  }

  async function handleDelete(todo: Todo) {
    setDeleteConfirm(null);
    try {
      await deleteTodo(todo.id);
      addToast('Task deleted');
    } catch {
      addToast('Failed to delete task', 'error');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Tasks</h1>
          {!loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {todos.length} total · {todos.filter((t) => !t.completed).length} active
            </p>
          )}
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden />
            <input
              type="search"
              placeholder="Search tasks…"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              aria-label="Search tasks"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-colors"
            />
          </div>
          <button
            onClick={() => setFilterOpen((v) => !v)}
            aria-label="Toggle filters"
            aria-expanded={filterOpen}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              activeFilterCount > 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <SlidersHorizontal size={15} />
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className={`${filterOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2`}>
          <select value={filters.status}     onChange={(e) => updateFilter('status',     e.target.value as FilterStatus)}   className={SELECT} aria-label="Filter by status">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select value={filters.priority}   onChange={(e) => updateFilter('priority',   e.target.value as Priority | 'all')} className={SELECT} aria-label="Filter by priority">
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filters.categoryId} onChange={(e) => updateFilter('categoryId', e.target.value)}                   className={SELECT} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.sort}       onChange={(e) => updateFilter('sort',       e.target.value as SortOption)}      className={SELECT} aria-label="Sort tasks">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="due_date">Due date</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">A → Z</option>
          </select>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              <RotateCcw size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {error ? (
          <div role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          todos.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={48} />}
              title="No tasks yet"
              description="Create your first task to get started."
              action={<Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>New Task</Button>}
            />
          ) : (
            <EmptyState
              icon={<Search size={48} />}
              title="No tasks match"
              description="Try adjusting your search or filters."
              action={<button onClick={resetFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Clear filters</button>}
            />
          )
        ) : (
          <div className="space-y-3 max-w-2xl">
            {filtered.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={() => handleToggle(todo)}
                onEdit={() => setEditTodo(todo)}
                onDelete={() => setDeleteConfirm(todo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New Task">
        <TodoForm categories={categories} onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTodo} onClose={() => setEditTodo(null)} title="Edit Task">
        {editTodo && (
          <TodoForm initial={editTodo} categories={categories} onSubmit={handleUpdate} onCancel={() => setEditTodo(null)} />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" size="sm">
        {deleteConfirm && (
          <div className="px-4 sm:px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900 dark:text-gray-50">"{deleteConfirm.title}"</span>?{' '}
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
              <Button variant="danger"    onClick={() => handleDelete(deleteConfirm)} className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
