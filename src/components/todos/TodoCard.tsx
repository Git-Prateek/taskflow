import { Pencil, Trash2, Calendar } from 'lucide-react';
import type { Todo } from '../../types';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import { priorityBadgeClass, PRIORITY_LABELS } from '../../utils/priorityUtils';

interface TodoCardProps {
  todo: Todo;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
}

export default function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const overdue    = isOverdue(todo.due_date, todo.completed);
  const dateLabel  = formatDate(todo.due_date);

  return (
    <div
      className={`group flex gap-3 p-4 rounded-xl border transition-colors
        bg-white dark:bg-gray-900 ${
          todo.completed
            ? 'border-gray-100 dark:border-gray-800/60'
            : 'border-gray-200 dark:border-gray-800'
        }`}
    >
      {/* Circular checkbox with proper ARIA semantics */}
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
        className={`mt-0.5 shrink-0 w-5 h-5 min-w-[20px] rounded-full border-2 transition-colors
          flex items-center justify-center ${
            todo.completed
              ? 'bg-indigo-600 border-indigo-600'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
      >
        {todo.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium leading-snug break-words ${
              todo.completed
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-50'
            }`}
          >
            {todo.title}
          </p>

          {/* Action buttons — always visible; 44px min touch target */}
          <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              aria-label="Edit task"
              className="min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete task"
              className="min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400
                hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {todo.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {todo.description}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${priorityBadgeClass(todo.priority)}`}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>

          {todo.category && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: todo.category.color }}
                aria-hidden
              />
              {todo.category.name}
            </span>
          )}

          {dateLabel && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                overdue
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Calendar size={11} aria-hidden />
              {overdue ? `Overdue · ${dateLabel}` : dateLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
