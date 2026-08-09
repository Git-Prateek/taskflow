# TaskFlow — Phase 1 Architecture

## Tech Stack
- React 19 + TypeScript (Vite 8)
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- Supabase (Auth + PostgreSQL + RLS)
- Lucide React (icons)
- React Router v7
- Netlify (free-tier deployment)

---

## Folder Structure

src/
  components/
    ui/              # Primitives: Button, Input, Badge, Modal, Spinner, etc.
    layout/          # AppShell, Sidebar, Header, MobileNav
    auth/            # LoginForm, SignupForm, AuthGuard
    todos/           # TodoCard, TodoList, TodoForm, TodoActions
    categories/      # CategoryBadge, CategoryForm, CategoryList
    dashboard/       # StatsCard, ProgressRing, DashboardGrid
    filters/         # SearchBar, FilterBar, SortMenu, FilterDrawer (mobile)
    common/          # EmptyState, ErrorMessage, SkeletonCard, Toast
  contexts/
    AuthContext.tsx   # Session, user, login/logout helpers
    ThemeContext.tsx  # theme state, toggle, persistence
  hooks/
    useTodos.ts          # CRUD, optimistic updates
    useCategories.ts     # Category CRUD
    useDashboardStats.ts # Derived stats from todos
    useFilters.ts        # Search/filter/sort state
    useToast.ts          # Toast queue management
  lib/
    supabase.ts          # Supabase client (reads from env vars)
  services/
    todoService.ts       # All Supabase todo queries
    categoryService.ts   # All Supabase category queries
  types/
    index.ts             # Todo, Category, User, Filter, Sort types
  utils/
    dateUtils.ts         # Format dates, detect overdue
    priorityUtils.ts     # Priority labels, colors, sort weights
  pages/
    AuthPage.tsx
    DashboardPage.tsx
    TasksPage.tsx
    CategoriesPage.tsx
    SettingsPage.tsx
  App.tsx                # Router, providers

---

## Database Schema

```sql
-- PROFILES (extends auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- CATEGORIES
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text not null default '#6366f1',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_categories_user_id on public.categories(user_id);

-- TODOS
create type public.priority_level as enum ('low', 'medium', 'high');

create table public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title       text not null,
  description text,
  completed   boolean not null default false,
  priority    priority_level not null default 'medium',
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_todos_user_id     on public.todos(user_id);
create index idx_todos_category_id on public.todos(category_id);
create index idx_todos_due_date    on public.todos(due_date);
create index idx_todos_completed   on public.todos(completed);

-- AUTO-UPDATE updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger todos_updated_at
  before update on public.todos
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- AUTO-CREATE PROFILE + DEFAULT CATEGORIES on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.categories (user_id, name, color, is_default) values
    (new.id, 'Personal',  '#6366f1', true),
    (new.id, 'Work',      '#f59e0b', true),
    (new.id, 'Study',     '#10b981', true),
    (new.id, 'Shopping',  '#ec4899', true),
    (new.id, 'Other',     '#6b7280', true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ROW LEVEL SECURITY
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.todos      enable row level security;

create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own categories"   on public.categories for select using (auth.uid() = user_id);
create policy "Users can create own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

create policy "Users can view own todos"   on public.todos for select using (auth.uid() = user_id);
create policy "Users can create own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos" on public.todos for update using (auth.uid() = user_id);
create policy "Users can delete own todos" on public.todos for delete using (auth.uid() = user_id);
```

---

## Data Flow

User Action
  → React Component
  → Custom Hook (useTodos / useCategories)
  → Service Layer (todoService.ts / categoryService.ts)
  → Supabase JS Client (lib/supabase.ts)
  → Supabase REST API
  → PostgreSQL + RLS policies

Components never call Supabase directly — only through hooks → services.

---

## Authentication Flow

App loads
  → supabase.auth.getSession()
    ├─ session found → AuthContext.user set → render protected app
    └─ no session → render AuthPage (Login / Signup tabs)

Sign Up:
  supabase.auth.signUp({ email, password })
  → on_auth_user_created trigger fires → profile + default categories created
  → AuthContext receives session → redirect to /dashboard

Login:
  supabase.auth.signInWithPassword({ email, password })
  → session stored in localStorage by Supabase SDK
  → AuthContext.user set → redirect to /dashboard

Logout:
  supabase.auth.signOut()
  → session cleared → AuthContext.user null → redirect to /auth

Session Persistence:
  Supabase SDK persists JWT in localStorage automatically.
  On refresh, getSession() restores it — no manual token handling.

Route Protection:
  <AuthGuard> wraps all protected routes.
  Shows full-page spinner during initial session check.
  Redirects to /auth if no user.

---

## Responsive Design Strategy

Breakpoints (Tailwind defaults, used intentionally):
  (none)   0–639px    Mobile-first base styles
  sm:      640px+     Large phones / small tablets
  md:      768px+     Tablets
  lg:      1024px+    Laptops — sidebar becomes visible
  xl:      1280px+    Desktops
  2xl:     1536px+    Large monitors

Layout:
  Mobile  (<1024px): compact header + full-width content + fixed bottom tab bar
  Desktop (≥1024px): 240px sidebar + main content area (max-w-5xl, centered)

Key rules:
  - No fixed widths on cards/forms — use w-full + max-w-* + mx-auto
  - Filter bar collapses to a drawer on mobile; renders inline on md:+
  - Todo form: full-page modal on mobile, centered dialog on desktop
  - Dashboard stats: grid-cols-2 mobile → grid-cols-4 desktop
  - Touch targets: minimum 44×44px on mobile
  - Bottom navigation: hidden on lg:+; sidebar hidden below lg

Tested breakpoints:
  320px / 375px / 414px / 768px / 1024px / 1280px / 1440px+

---

## Theme Architecture

Strategy: Tailwind darkMode: 'class'
  - 'dark' class toggled on <html> element
  - ThemeContext stores: 'light' | 'dark' | 'system'

Flash prevention:
  Inline <script> in index.html runs before React mounts.
  Reads localStorage('taskflow-theme'), applies class synchronously.
  No theme flash on page refresh.

ThemeContext lifecycle:
  Mount: read localStorage → detect system pref → apply class
  Toggle: update state + localStorage + toggle class on <html>
  System: listens to prefers-color-scheme media query changes

Color token conventions:
  Page background : bg-gray-50       dark:bg-gray-950
  Card surface    : bg-white         dark:bg-gray-900
  Card border     : border-gray-200  dark:border-gray-800
  Primary text    : text-gray-900    dark:text-gray-50
  Secondary text  : text-gray-500    dark:text-gray-400
  Input bg        : bg-white         dark:bg-gray-800
  Input border    : border-gray-300  dark:border-gray-600
  Brand accent    : indigo-600       dark:indigo-400

All components must use this token set. No hardcoded colors.

---

## TypeScript Types (src/types/index.ts)

  Priority     = 'low' | 'medium' | 'high'
  Theme        = 'light' | 'dark' | 'system'
  FilterStatus = 'all' | 'active' | 'completed' | 'overdue'
  SortOption   = 'newest' | 'oldest' | 'due_date' | 'priority' | 'alphabetical'

  Profile       { id, email, full_name, avatar_url, created_at, updated_at }
  Category      { id, user_id, name, color, is_default, created_at }
  Todo          { id, user_id, category_id, title, description, completed,
                  priority, due_date, created_at, updated_at, category? }
  FilterState   { search, status, priority, categoryId, sort }
  TodoFormData  { title, description, priority, category_id, due_date }
  DashboardStats { total, active, completed, overdue, completionPercent }

---

## Environment Variables

Local:    .env.local  (gitignored)
Template: .env.example

  VITE_SUPABASE_URL      = https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY = your-anon-key-here

Netlify: set in Site Settings → Environment Variables (same keys).

---

## Deployment

Netlify (free tier):
  - Build command : npm run build
  - Publish dir   : dist
  - SPA routing   : netlify.toml [[redirects]] /* → /index.html (200)
  - Node version  : 20

Supabase (free tier):
  - Auth, PostgreSQL, RLS all included
  - No credit card required for free tier

---

## Build Phases

  Phase 1  Architecture (complete)
  Phase 2  Auth + scaffold (complete)
  Phase 3  Database schema applied to Supabase, services, RLS verification (complete)
  Phase 4  Full CRUD: todos, categories, priority, due dates (complete)
  Phase 5  Search, filter, sort, dashboard statistics (complete)
  Phase 6  Responsive audit at every breakpoint (complete)
  Phase 7  Theme system + dark mode across all components (complete)
  Phase 8  Polish: accessibility, loading/empty/error states, animations (complete)
  Phase 9  Code splitting, README, deployment — PROJECT COMPLETE
