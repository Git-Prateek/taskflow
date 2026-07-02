import { useState, useEffect, useCallback } from 'react';
import type { Category, CategoryFormData } from '../types';
import * as categoryService from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setCategories(await categoryService.fetchCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createCategory = useCallback(async (input: CategoryFormData) => {
    const category = await categoryService.createCategory(input);
    setCategories((prev) => [...prev, category]);
    return category;
  }, []);

  const updateCategory = useCallback(async (id: string, input: Partial<CategoryFormData>) => {
    const updated = await categoryService.updateCategory(id, input);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await categoryService.deleteCategory(id);
    } catch {
      load();
      throw new Error('Failed to delete category');
    }
  }, [load]);

  return { categories, loading, error, reload: load, createCategory, updateCategory, deleteCategory };
}
