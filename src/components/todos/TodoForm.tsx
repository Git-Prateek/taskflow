import { useState } from 'react';
import type { Todo, TodoFormData, Category, Priority } from '../../types';
import Button from '../ui/Button';

interface TodoFormProps {
  initial?:    Todo;
  categories:  Category[];
  onSubmit:    (data: TodoFormData) => Promise<void>;
  onCancel:    () => void;
}

const INPUT =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 ' +
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 ' +
  'placeholder-gray-400 dark:placeholder-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ' +
  'text-sm transition-colors';

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function TodoForm({ initial, categories, onSubmit, onCancel }: TodoFormProps) {
  const [form, setForm] = useState<TodoFormData>({
    title:       initial?.title       ?? '',
    description: initial?.description ?? '',
    priority:    initial?.priority    ?? 'medium',
    category_id: initial?.category_id ?? '',
    due_date:    initial?.due_date    ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function set<K extends keyof TodoFormData>(key: K, value: TodoFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-4 sm:px-6 py-5 space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="tf-title" className={LABEL}>
          Title <span className="text-red-500" aria-hidden>*</span>
        </label>
        <input
          id="tf-title"
          type="text"
          autoFocus
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="What needs to be done?"
          className={INPUT}
          aria-required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="tf-desc" className={LABEL}>Description</label>
        <textarea
          id="tf-desc"
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Add more details…"
          className={`${INPUT} resize-none`}
        />
      </div>

      {/* Priority + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tf-priority" className={LABEL}>Priority</label>
          <select
            id="tf-priority"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value as Priority)}
            className={INPUT}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="tf-category" className={LABEL}>Category</label>
          <select
            id="tf-category"
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
            className={INPUT}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date */}
      <div>
        <label htmlFor="tf-due" className={LABEL}>Due date</label>
        <input
          id="tf-due"
          type="date"
          value={form.due_date}
          onChange={(e) => set('due_date', e.target.value)}
          className={INPUT}
        />
      </div>

      {error && (
        <div role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={submitting} className="flex-1">
          {initial ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}
