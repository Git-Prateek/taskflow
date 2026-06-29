import { supabase } from '../lib/supabase';
import type { Category, CategoryFormData } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function createCategory(input: CategoryFormData): Promise<Category> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: user.id, name: input.name.trim(), color: input.color, is_default: false })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(id: string, input: Partial<CategoryFormData>): Promise<Category> {
  const patch: Record<string, unknown> = {};
  if (input.name  !== undefined) patch.name  = input.name.trim();
  if (input.color !== undefined) patch.color = input.color;

  const { data, error } = await supabase
    .from('categories')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
