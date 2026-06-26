import { useState } from 'react';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useToast }      from '../contexts/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Modal             from '../components/ui/Modal';
import Button            from '../components/ui/Button';
import EmptyState        from '../components/common/EmptyState';
import type { Category, CategoryFormData } from '../types';

const PRESET_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ec4899', '#6b7280',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316',
];

const INPUT =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 ' +
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 ' +
  'placeholder-gray-400 dark:placeholder-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-colors';

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

interface CategoryFormProps {
  initial?:  Category;
  onSubmit:  (data: CategoryFormData) => Promise<void>;
  onCancel:  () => void;
}

function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [name,       setName]       = useState(initial?.name  ?? '');
  const [color,      setColor]      = useState(initial?.color ?? PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, color });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-4 sm:px-6 py-5 space-y-4">
      <div>
        <label htmlFor="cat-name" className={LABEL}>
          Name <span className="text-red-500" aria-hidden>*</span>
        </label>
        <input
          id="cat-name"
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Health, Finance…"
          className={INPUT}
          aria-required
        />
      </div>

      <div>
        <p className={LABEL}>Colour</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Select colour ${c}`}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          {/* Custom colour picker */}
          <label className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors" aria-label="Custom colour">
            <span className="text-gray-400 text-xs">+</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
          </label>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{color}</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={submitting} className="flex-1">
          {initial ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
  const { addToast } = useToast();
  useDocumentTitle('Categories');

  const [formOpen,      setFormOpen]      = useState(false);
  const [editCat,       setEditCat]       = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  async function handleCreate(data: CategoryFormData) {
    await createCategory(data);
    setFormOpen(false);
    addToast('Category created');
  }

  async function handleUpdate(data: CategoryFormData) {
    if (!editCat) return;
    await updateCategory(editCat.id, data);
    setEditCat(null);
    addToast('Category updated');
  }

  async function handleDelete(cat: Category) {
    setDeleteConfirm(null);
    try {
      await deleteCategory(cat.id);
      addToast('Category deleted');
    } catch {
      addToast('Failed to delete category', 'error');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Categories</h1>
          {!loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} categories</p>
          )}
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
          <span className="hidden sm:inline">New Category</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {error ? (
          <div role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={<Tag size={48} />}
            title="No categories yet"
            description="Create a category to organise your tasks."
            action={<Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>New Category</Button>}
          />
        ) : (
          <div className="space-y-3 max-w-2xl">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <span className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{cat.name}</p>
                  {cat.is_default && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Default</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditCat(cat)}
                    aria-label={`Edit ${cat.name}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New Category" size="sm">
        <CategoryForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editCat} onClose={() => setEditCat(null)} title="Edit Category" size="sm">
        {editCat && (
          <CategoryForm initial={editCat} onSubmit={handleUpdate} onCancel={() => setEditCat(null)} />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Category" size="sm">
        {deleteConfirm && (
          <div className="px-4 sm:px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900 dark:text-gray-50">"{deleteConfirm.name}"</span>?{' '}
              Tasks in this category will become uncategorised.
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
