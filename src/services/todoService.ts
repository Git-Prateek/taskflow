import { supabase } from '../lib/supabase';
import type { Todo, TodoFormData } from '../types';

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Todo[];
}

export async function createTodo(input: TodoFormData): Promise<Todo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id:     user.id,
      title:       input.title.trim(),
      description: input.description.trim() || null,
      priority:    input.priority,
      category_id: input.category_id || null,
      due_date:    input.due_date    || null,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) throw new Error(error.message);
  return data as Todo;
}

export async function updateTodo(id: string, input: Partial<TodoFormData>): Promise<Todo> {
  const patch: Record<string, unknown> = {};
  if (input.title       !== undefined) patch.title       = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.priority    !== undefined) patch.priority    = input.priority;
  if (input.category_id !== undefined) patch.category_id = input.category_id || null;
  if (input.due_date    !== undefined) patch.due_date    = input.due_date    || null;

  const { data, error } = await supabase
    .from('todos')
    .update(patch)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) throw new Error(error.message);
  return data as Todo;
}

export async function toggleTodoComplete(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
