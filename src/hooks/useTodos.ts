import { useState, useEffect, useCallback } from 'react';
import type { Todo, TodoFormData } from '../types';
import * as todoService from '../services/todoService';
import { useAuth } from '../contexts/AuthContext';

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos]     = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setTodos(await todoService.fetchTodos());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createTodo = useCallback(async (input: TodoFormData) => {
    const todo = await todoService.createTodo(input);
    setTodos((prev) => [todo, ...prev]);
    return todo;
  }, []);

  const updateTodo = useCallback(async (id: string, input: Partial<TodoFormData>) => {
    const updated = await todoService.updateTodo(id, input);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const toggleComplete = useCallback(async (id: string, completed: boolean) => {
    // Optimistic update
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    try {
      await todoService.toggleTodoComplete(id, completed);
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
      throw new Error('Failed to update task');
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await todoService.deleteTodo(id);
    } catch {
      load(); // revert by reloading
      throw new Error('Failed to delete task');
    }
  }, [load]);

  return { todos, loading, error, reload: load, createTodo, updateTodo, toggleComplete, deleteTodo };
}
