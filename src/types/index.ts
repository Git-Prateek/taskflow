export type Priority = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue';
export type SortOption = 'newest' | 'oldest' | 'due_date' | 'priority' | 'alphabetical';

export interface FilterState {
  search: string;
  status: FilterStatus;
  priority: Priority | 'all';
  categoryId: string | 'all';
  sort: SortOption;
}

export interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  category_id: string;
  due_date: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionPercent: number;
}

export type Theme = 'light' | 'dark' | 'system';
