# TaskFlow

A production-quality task management web application built as a portfolio project. Demonstrates professional frontend development — responsive design, authentication, PostgreSQL with Row Level Security, accessibility, and modern React patterns.

> **Completely free to develop and deploy** — Supabase free tier + Netlify free tier. No credit card required.

---

## Features

- **Authentication** — sign up, sign in, sign out, and password reset via Supabase Auth with persistent sessions
- **Task management** — create, edit, delete, complete/uncomplete tasks with priority (low/medium/high), due dates, descriptions, and categories
- **Categories** — five built-in categories plus unlimited custom categories with a colour picker
- **Search, filter & sort** — real-time search across title and description; filter by status, priority, and category; sort by date, priority, or alphabetically
- **Dashboard** — live statistics, circular progress ring, breakdown bars, overdue alert, and recent task feed — all update automatically when tasks change
- **Theme system** — Light, Dark, and System modes with zero flash on page load; preference persisted in localStorage
- **Responsive** — mobile-first design tested at 320 px, 375 px, 414 px, 768 px, 1024 px, 1280 px, and 1440 px+
- **Accessible** — semantic HTML, ARIA roles, keyboard navigation, focus trapping in modals, skip-to-content link, visible focus indicators
- **Animated** — modal slide-up (iOS sheet on mobile), toast slide-in, skeleton loading states
- **Secure** — Supabase Row Level Security enforced at the database level; users can only access their own data

---

## Screenshots

> Add screenshots here after deployment

| Auth | Dashboard | Tasks |
|------|-----------|-------|
| ![Auth]() | ![Dashboard]() | ![Tasks]() |

| Dark Mode | Mobile | Settings |
|-----------|--------|----------|
| ![Dark]() | ![Mobile]() | ![Settings]() |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 19 + TypeScript | Industry standard; React Compiler for automatic memoisation |
| Build tool | Vite 8 | Fast HMR, optimised production builds, excellent TS support |
| Styling | Tailwind CSS v4 | Utility-first, zero runtime overhead, class-based dark mode |
| Backend | Supabase | PostgreSQL + Auth + RLS — fully managed, free tier |
| Icons | Lucide React | Consistent, tree-shakeable SVG icons |
| Router | React Router v7 | Client-side routing with lazy-loaded page chunks |
| Deployment | Netlify | Zero-config SPA deployment, free tier |

---

## Architecture

`
src/
├── components/
│   ├── ui/           # Primitives: Button, Modal (with focus trap)
│   ├── layout/       # AppShell — sidebar (desktop), bottom tab bar (mobile)
│   ├── auth/         # AuthGuard — redirects unauthenticated users
│   ├── todos/        # TodoCard, TodoForm
│   ├── dashboard/    # StatsCard, ProgressRing (SVG)
│   └── common/       # EmptyState, SkeletonCard, Toaster, ErrorBoundary
├── contexts/
│   ├── AuthContext.tsx   # Session state, sign-in/up/out helpers
│   ├── ThemeContext.tsx  # Light/dark/system + color-scheme persistence
│   └── ToastContext.tsx  # Toast queue with 4 s auto-dismiss
├── hooks/
│   ├── useTodos.ts           # CRUD with optimistic toggle/delete
│   ├── useCategories.ts      # Category CRUD
│   ├── useFilters.ts         # Search/filter/sort computed with useMemo
│   ├── useDashboardStats.ts  # Pure derivation from Todo[]
│   └── useDocumentTitle.ts   # Updates browser tab title per route
├── lib/
│   └── supabase.ts    # Supabase client initialised from environment variables
├── services/
│   ├── todoService.ts      # Supabase queries for todos
│   └── categoryService.ts  # Supabase queries for categories
├── types/
│   └── index.ts    # Todo, Category, FilterState, DashboardStats, Theme
├── utils/
│   ├── dateUtils.ts      # formatDate, isOverdue (timezone-safe)
│   └── priorityUtils.ts  # Labels, sort weights, Tailwind badge classes
└── pages/
    ├── AuthPage.tsx
    ├── DashboardPage.tsx
    ├── TasksPage.tsx
    ├── CategoriesPage.tsx
    └── SettingsPage.tsx
`

**Data flow:**
`
Component → Custom Hook → Service Layer → Supabase Client → PostgreSQL + RLS
`

Components never call Supabase directly. Hooks own loading/error state. Services are plain async functions — no React dependencies, easy to test.

**Route-level code splitting:** all page components use `React.lazy` — the initial bundle contains only the shell and providers. Each page chunk loads on first navigation.

---

## Database Schema

`sql
-- Profiles (auto-created on signup via trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  is_default boolean not null default false,
  created_at timestamptz default now()
);

-- Todos
create type public.priority_level as enum ('low', 'medium', 'high');

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  completed boolean not null default false,
  priority priority_level not null default 'medium',
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
`

See [ARCHITECTURE.d](ARCHITECTURE.d) for the complete schema including triggers, indexes, and RLS policies.

---

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com) — no credit card required
2. Open **SQL Editor → New query** and paste the full schema from the "Database Schema" section in [ARCHITECTURE.d](ARCHITECTURE.d)
3. Click **Run** — creates all tables, triggers (auto-profile + default categories on signup), indexes, and RLS policies
4. Go to **Settings → API** and copy your **Project URL** and **anon public key**

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

The anon key is safe to expose — it is designed to be public and is protected entirely by RLS.

---

## Local Development

**Prerequisites:** Node.js >= 20, npm

`ash
git clone https://github.com/your-username/taskflow.git
cd taskflow
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and paste your Supabase credentials

npm run dev
# http://localhost:5173
`

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Netlify Deployment

1. Push the repository to GitHub
2. Log in to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repository — build settings are auto-detected from `netlify.toml`
4. Add environment variables in **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

SPA routing is configured in `netlify.toml`: all routes serve `index.html` with HTTP 200, so React Router handles navigation and refreshing `/dashboard` does not result in a 404.

---

## Security & RLS

All three tables have Row Level Security enabled. Every policy uses `auth.uid()` to compare against the row's `user_id` column — enforced at the PostgreSQL level, not in application code.

`sql
-- Example: users can only access their own todos
create policy "Users can view own todos"
  on public.todos for select using (auth.uid() = user_id);

create policy "Users can create own todos"
  on public.todos for insert with check (auth.uid() = user_id);
`

Even if a client sends a crafted query with a different `user_id`, Supabase rejects it at the database level before it reaches the application.

**Additional practices:**
- Service role key is never exposed to the client
- All input is trimmed before insertion; empty strings stored as `null`
- Zero `any` types — TypeScript is strict throughout
- Passwords are never stored or handled manually

---

## Responsive Design

Built mobile-first with Tailwind's default breakpoints.

| Screen | Width | Layout |
|--------|-------|--------|
| Mobile S | 320 px | Single column, bottom tab bar, stacked filters |
| Mobile L | 375–414 px | Single column, touch-optimised tap targets (44 px min) |
| Tablet | 768 px | Filter controls visible inline |
| Laptop | 1024 px | Sidebar replaces bottom tab bar; dashboard 4-column grid |
| Desktop | 1280 px+ | Max content width with sidebar fixed |

Mobile-specific patterns:
- Modals slide up from the bottom (iOS bottom-sheet style)
- Filter toolbar collapses into a button with active-filter count badge
- No horizontal scrolling at any breakpoint
- Bottom tab bar with `min-h-[56px]` ensuring comfortable touch targets

---

## Theme System

Strategy: `darkMode: 'class'` in Tailwind — the `dark` class is toggled on `<html>`.

**Zero flash on load:** an inline `<script>` in `index.html` runs before React mounts, reads `localStorage`, and applies both the `dark` CSS class and the `color-scheme` style property synchronously — the correct theme is applied before the first paint, with no React involvement.

**`color-scheme`:** set on `<html>` by `ThemeContext` so native browser elements (date pickers, scrollbars, select dropdowns) also adapt to the selected theme automatically.

| Mode | Behaviour |
|------|-----------|
| Light | Always light |
| Dark | Always dark |
| System | Follows OS `prefers-color-scheme`; updates live if OS changes |

Selected from the Settings page; saved to `localStorage('taskflow-theme')`.

---

## Technical Decisions

**Optimistic updates** — `useTodos.toggleComplete` and `deleteTodo` update local state before the network request. If the request fails, state is reverted. The UI feels instant even on slow connections.

**No global state library** — React Context + custom hooks cover all state needs without adding Redux or Zustand. The rule is: Context for cross-cutting concerns (auth, theme, toasts); local state for UI; hooks for data fetching.

**Pure service layer** — `todoService.ts` and `categoryService.ts` are plain async functions with no React dependencies. They can be tested without a DOM and swapped for a different backend without touching hooks or components.

**Focus trap in modals** — when a modal opens, `Tab`/`Shift+Tab` cycle only through the modal's focusable elements. Focus returns to the trigger element when the modal closes. This is implemented natively without a library using `querySelectorAll` + keyboard event listeners.

---

## Future Improvements

- Subtasks (nested task lists)
- Recurring tasks (daily / weekly / monthly)
- Drag-and-drop reordering with `@dnd-kit/core`
- Real-time multi-device sync via Supabase Realtime subscriptions
- Browser push notifications for overdue tasks
- Export tasks as CSV or JSON
- Progressive Web App (service worker, offline support)
- Shared lists (collaborate on a category with other users)
- Keyboard shortcuts (`N` for new task, `/` to focus search)

---

## Licence

MIT
