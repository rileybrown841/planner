<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Planner — project notes

Single-user personal planner PWA. Full plan and phased build order in
`projectplan.md`. **All nine phases are built.**
Repo `github.com/rileybrown841/planner` (`main`). Migrations `0001`–`0004`
applied (`0002`–`0004` via MCP `apply_migration`). Phases 7–9 added no schema.

## Phase 9 (polish — theme, type, search, perf, a11y)

- **Theme lives in `src/app/globals.css`.** Full pastel palette leaning
  green/cool. `:root` + `.dark` hold raw role vars; a `@theme` block **remaps the
  Tailwind scales the app already uses** so components need no per-element edits:
  - `--color-indigo-*` → sage-green accent. `600/500/700` are pinned hex so
    filled buttons keep white text in both themes; `300/400` back the
    `dark:text-indigo-*` variants; `50/100` → `--accent-tint`.
  - `--color-zinc-*` is **hybrid**: `500`/`400` are theme-aware
    (`var(--muted)` / `var(--muted-2)`, the roles used bare with no `dark:`
    sibling); `950–600` and `300–50` are static cool-grays (they always appear
    with a matching `dark:` sibling). Do **not** point the static steps at
    `--line`/`--fg-*` — that regresses `dark:text-zinc-100/200/300` to invisible.
  - `--background`/`--foreground`/`--surface` are theme-aware; `bg-[var(--surface)]`
    is the popover/dropdown background (plain `dark:bg-zinc-900` breaks post-remap).
- **Dark mode:** `next-themes`, class strategy, in `<Providers>`. Toggle =
  `<ThemeToggle>` on `/settings` (Light / System / Dark). `<html
  suppressHydrationWarning>`. The React "script tag while rendering" console
  warning in dev is next-themes' anti-flash script — harmless.
- **Type:** `next/font/google` Nunito (`--font-nunito` → `--font-sans`) + Caveat
  (`--font-caveat` → `--font-display`). `.font-display` utility = Caveat; used
  only on big page `<h1>`s and the `/today` greeting. Everything else is Nunito.
- **Fonts you may see as "unloaded" in `document.fonts`** (`__nextjs-Geist*`) are
  the dev overlay's, not ours.
- **Search:** `getSearchIndex()` (`src/lib/data/search.ts`, `cache()`d) → flat
  `SearchEntry[]`. `<SearchPalette index>` (native `<dialog>`, ⌘K / `Ctrl K` or
  the `planner:open-search` window event) does client substring filtering.
  `<SearchButton variant="bar"|"icon">` triggers it (sidebar / mobile header).
  Both mounted in `(app)/layout.tsx`'s `<ShellExtras>` (Suspense-wrapped with the
  FAB data so `{children}` streams first).
- **Perf:** `(app)/loading.tsx` skeleton; `<ShellExtras>` Suspense boundary so the
  layout only awaits `requireUser()`; `next.config.ts`
  `optimizePackageImports: ["lucide-react"]`.
- **a11y sweep:** `.focus-ring` utility in `globals.css` (transparent outline →
  `var(--accent)` on `:focus-visible`) on nav links, calendar chips/cells, the
  FAB, search buttons, menu items. Calendar prev/next bumped to 40px. Reduced-
  motion guard already in `globals.css`.

## Phase 8 (budgeting)

- **Schema was already in `0001`** — `budget_categories` (`name`,
  `monthly_limit` numeric, `color`) + `transactions` (`category_id` **nullable,
  `on delete set null`**, `amount` numeric **always positive**, `type`
  `expense|income`, `occurred_on` date, `note`). No migration.
- **Reads** (`src/lib/data/budget.ts`): `listBudgetCategories()`,
  `getBudgetCategory(id)`, `listTransactions()` (all, newest first, with
  `category:budget_categories(...)` embed), `getTransaction(id)`, `getBudgetData()`
  = categories + transactions.
- **Maths client-side + pure** (`src/lib/budget.ts`): `monthKey`/`txnMonth`/
  `monthLabel`/`shiftMonth`, `monthSummary(categories, transactions, "YYYY-MM")`
  → per-category `{spent, limit, remaining, pct, over}` + totals
  `{totalSpent, totalBudgeted, totalIncome, net, uncategorisedSpent}`, and
  `groupByMonth` for the log. `occurred_on` is the viewer's local `toDateKey`,
  sent by the client. `$` formatting is `src/lib/money.ts`.
- **`<BudgetOverview categories transactions>`** (client) computes the current
  local month: 3 tiles (Spent / Budgeted / Left-or-Over), an income+net line,
  `<CategoryProgress>` bars (sorted by % desc; amber ≥80%, red over), an
  Uncategorised line, and this month's `<TransactionRow>`s.
- **`<QuickTransaction categories>`** — inline expense capture on `/budget`
  (`createTransactionQuick` returns `succeeded()`, form `.reset()`s on success,
  like `<QuickAddForm>`). Income / back-dated entries use the full
  `<TransactionForm>` at `/budget/transactions/new`.
- **Routes:** `/budget` (overview), `/budget/transactions` (full log grouped by
  month via `<TransactionList>`), `/budget/transactions/new` + `/[id]/edit`,
  `/budget/categories/new` + `/[categoryId]/edit` (delete lives on the edit
  page). Category names + edit link are in the ⌘K index (`kind: "Budget category"`).
- `deleteBudgetCategory` relies on the FK `set null` — transactions keep their
  history and become uncategorised.

## Phase 7 (habits)

- **Schema was already in `0001`** — `habits` (`kind` `counter|checklist`,
  `target`, `unit`, `icon`, `color`, `is_archived`, `sort_order`) + `habit_logs`
  (`habit_id`, `log_date` date, `value`, **unique `(habit_id, log_date)`** — one
  row per habit per day). No migration for this phase.
- **Reads** (`src/lib/data/habits.ts`): `listHabits()` (active first),
  `getHabit(id)`, `listHabitLogs()` (all logs — table stays small for one user),
  `getHabitsData()` = habits + logs. `getDashboardData()` now also returns it.
- **Maths are client-side + pure** (`src/lib/habits.ts`): `currentStreak`
  (counts back from today, or yesterday if today isn't logged yet),
  `longestStreak`, `recentHistory`, `completedInWindow`, `statusLabel`, and
  `applyLogAction` — the `useOptimistic` reducer that mirrors the server
  read-modify-write. A day is "complete" when `value >= target` (or any
  `value > 0` when there's no target). `log_date` is the viewer's local
  `toDateKey`, sent by the client — never computed on the server.
- **Quick-tap:** `<HabitTracker habits logs>` (client) holds `useOptimistic`
  over the logs array + `useTransition` around `logHabit` (a plain
  `(FormData)=>void` action, `increment|decrement|toggle`; 0 removes the row).
  Renders `<HabitCard>` per habit. Used on `/habits`, `/habits/[id]`, and the
  dashboard "Habits" `<Panel>` (active habits only, hidden when there are none).
- **Routes:** `/habits` (active `<HabitTracker>` + archived `<details>`),
  `/habits/new`, `/habits/[id]` (today tracker + `<HabitHistory>` = 3 stat tiles
  + 30-day strip), `/habits/[id]/edit`. `<HabitForm>` has a controlled
  counter/checklist toggle that shows target+unit only for counters;
  `rawHabit()` clears target/unit server-side when kind is checklist.
- Archive is a soft flag (`archiveHabit`/`unarchiveHabit`), not the
  semester-style read-only guard. `deleteHabit` cascades to `habit_logs`.
- Habits are in the ⌘K search index (`kind: "Habit"`).

## Phase 6 (dashboard)

`/today` is the dashboard (PWA start_url). Page fetches `getDashboardData()`
(`src/lib/data/dashboard.ts` = `getCalendarSources()` + `countOpenTasks()` +
`getHabitsData()`) and hands it to `<Dashboard>` (client) which computes
everything in the viewer's timezone: 3 stat tiles (`<StatTile>`), a Habits panel
(`<HabitTracker>`, Phase 7), a Today panel (reuses `<TodaySchedule>` +
`<DueSoon>`), and `<ComingUp>` (next-7-days all-day items via
`buildCalendarItems`, grouped by day).

## Phase 5 additions (exam/project tracker, task subtasks)

- **Assessments** (`assessments` table) = exams & projects: CRUD at `/exams`,
  countdown via `formatRelativeDue`/`DueBadge`, `completed_at` toggle (0002),
  done ones collapse. `class_id` optional. Show on the calendar as all-day
  `kind: "assessment"` items.
- **Two subtask relationships**, both plain `tasks` rows:
  - `tasks.assessment_id` → step of an exam/project (created on the exam page).
  - `tasks.parent_task_id` (0002) → step of another task (created on that task's
    page). Deleting a parent cascades to its steps.
  - Steps inherit the parent's class / activity; they flow through `/tasks`,
    `/today`, the calendar with no extra plumbing. `<StepList>` + `<StepAdder>`
    (action `addStep`, `parent` = `"task:<id>"|"assessment:<id>"`).
- Board step progress ("2/4 steps") is computed client-side in `TaskBoard` from
  the full task list; `assessmentStepCounts()` does the same for `/exams` cards.
- `getTask` fetches the parent row in a second query (self-FK embed avoided).

## Phase 4 additions (calendar, events, meeting recurrence)

- **Meeting recurrence:** `Meeting` (was `ClassMeeting`) gains `freq?`
  (`weekly`/`biweekly`/`monthly`) + `anchor?` (YYYY-MM-DD). Classes stay weekly
  (editor hides it); extracurriculars use `<MeetingsEditor allowFrequency />`.
  Stored in the existing jsonb `schedule` — no migration.
- **Events:** the `events` table (title, starts_at, ends_at, all_day, location,
  notes, `recurrence_rule`, class_id XOR extracurricular_id). `recurrence_rule`
  holds the token `null|"weekly"|"biweekly"|"monthly"` (not iCal RRULE); anchor is
  `starts_at`. Recurring events edit/delete as a **whole series** (one row).
- **Recurrence expansion is client-side, no deps:** `src/lib/recurrence.ts`
  (`meetingDates`, `eventStartDates`). `src/lib/calendar.ts` `buildCalendarItems`
  turns sources → `CalendarItem[]` for a date range. Never expand on the server.
- **Calendar** (`/calendar`, `?view=month|week|day&date=`): `<CalendarView>` holds
  view+date in local state, syncs the URL with `history.replaceState` (instant
  nav, no refetch — all sources arrive as props from `getCalendarSources()`).
  Time-grid layout math in `src/lib/calendar-layout.ts`.
- Calendar shows **active-semester classes only**; activities/events/open-dated
  tasks always. `readMeetings` (FormData→rows) is shared in `src/lib/meetings.ts`.

### Follow-up: breaks + event end dates (migration `0003`)

- **`semesters.breaks`** — jsonb array of `{ name, start, end }` (inclusive
  `YYYY-MM-DD`), edited via `<BreaksEditor>` on the semester form,
  `readBreaks` in `src/lib/breaks.ts`, validated by `semesterBreakSchema`.
  `meetingDates(…, exclude?)` drops **class** meeting occurrences whose day
  lands in any break (activities are untouched). `buildCalendarItems` also emits
  one all-day `kind: "break"` `CalendarItem` per covered day — `<CalendarChip>`
  renders those as a non-interactive dashed pill; `<ComingUp>` filters them out.
- **`events.recurrence_until`** — `date|null`, the last day a recurring series
  produces an occurrence (`eventStartDates(…, until?)`). Surfaced as the "Ends"
  field on `<EventForm>` (only shown when Repeats ≠ none) and on the event
  detail page via `<EventWhen until>`.
- `maxDate`/`minDate` now live in `src/lib/dates.ts` (were private in
  `recurrence.ts`).

### Follow-up: per-occurrence delete (migration `0004`)

- **`classes.skip_dates` / `extracurriculars.skip_dates` / `events.skip_dates`**
  — jsonb `"YYYY-MM-DD"[]`. `buildCalendarItems` drops any class/activity/event
  occurrence whose local `toDateKey` is in its source's `skip_dates`, and stamps
  `recurring` on each `CalendarItem`.
- **Every non-break calendar item is a `<button>`** (`<CalendarChip>` /
  `<EventBlock>`) that opens `<OccurrenceDialog>` (state held in `<CalendarView>`
  as `selected`). The dialog offers "Open details" + — for class/activity/event —
  "Delete this occurrence" → `cancelOccurrence` (`src/lib/actions/calendar.ts`,
  `cancelOccurrenceSchema`). A non-recurring event is deleted outright; anything
  recurring gets the date appended to `skip_dates`. Dialog closes on success
  (same `useActionState` + effect pattern as `<QuickAddForm>`); the action's
  `revalidatePath` refreshes the calendar.
- Existing class/activity/event update actions set explicit columns, so
  `skip_dates` survives edits; a row delete drops its own jsonb.

## Phase 3 additions (tasks, extracurriculars)

- **Extracurriculars** are global (no semester link, no archive) — plain CRUD like
  classes minus the guard. `src/lib/{data,actions}/extracurriculars.ts`.
- **Tasks** link to a class XOR an activity via one `link` form field
  (`"class:<id>" | "activity:<id>" | ""`, parsed in `taskSchema`). `assessment_id`
  stays unused until Phase 5.
- **Timezone:** `due_date` is stored as a UTC ISO instant built **on the client**
  (`TaskForm` hidden `due_at`); date-only → local 23:59. All bucket / "overdue"
  math is client-side (`src/lib/dates.ts`) so it uses the viewer's day boundary —
  never compute task urgency on the server.
- **Optimistic complete:** `TaskBoard` / `TaskChecklist` use React 19
  `useOptimistic` + `useTransition` around the `setTaskStatus` action.
- **Quick-add:** `<QuickAddFab>` lives in `(app)/layout.tsx` — a `fixed` FAB +
  native `<dialog>`; `createTaskQuick` returns `succeeded()` (no redirect) and the
  dialog closes itself.

## Read / mutate pattern (Phase 2 — copy this for every feature)

- **Reads:** server-only helpers in `src/lib/data/<area>.ts`, wrapped in React
  `cache()`, each calls `requireUser()` then queries via the RLS'd server client.
  Type results with `.returns<T>()` / `.maybeSingle<T>()` against hand-written
  interfaces in `src/lib/types.ts` (no generated Supabase types yet).
- **Mutations:** Server Actions in `src/lib/actions/<area>.ts` (`"use server"`).
  Start with `requireUser()`, validate FormData with a zod schema from
  `src/lib/schemas.ts`, write, then `revalidatePath(...)` + `redirect(...)`.
  Form actions return `ActionResult` (`src/lib/form.ts`); simple toggle/delete
  actions are `(FormData) => Promise<void>` and bounce back with `?error=` on failure.
- **Forms:** Client Components using `useActionState`; bound actions
  (`updateX.bind(null, id)`) passed as the `action` prop. Shared UI:
  `src/components/ui/{button,form-field}.tsx`.
- **Dynamic route hrefs:** build them with helpers in `src/lib/routes.ts` —
  `typedRoutes` can't infer a bare template literal passed through a prop.
- **Archived semesters are read-only:** `assertSemesterWritable()` from
  `src/lib/data/guards.ts` at the top of every semester/class mutation; UI hides
  edit/delete controls and shows `<ReadOnlyBanner>`.
- **Active semester** = the `semesters` row with `is_active = true`. Switch it via
  `activateSemester`. `/classes` shows the active one; `/semesters/[id]` shows any.

## Conventions established in Phase 1

- **Auth gate:** `requireUser()` / `getUser()` from `src/lib/auth.ts` in every
  Server Component, Server Action and Route Handler that touches user data.
  `src/proxy.ts` only does an optimistic redirect — it is not the security layer.
- **Single-user lock:** `ALLOWED_EMAIL` env var + `shouldCreateUser: false` +
  Supabase signups disabled + RLS. Keep all four.
- **Supabase clients:** `src/lib/supabase/{client,server,proxy}.ts`. Never import
  `server.ts` into a Client Component. Env var for the key is
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase's newer name for the anon key).
- **Data layer:** TanStack Query on the client (`Providers`), `staleTime` 30s +
  refetch-on-focus is the cross-device sync strategy (no realtime yet).
- **DB:** every table has `user_id uuid default auth.uid()` and an owner-only RLS
  policy. `0001_initial_schema.sql` (all tables) is applied. Add new tables/columns
  as new numbered migrations with the same RLS pattern.
- **Nav:** add a section by creating `src/app/(app)/<name>/page.tsx` and an entry
  in `src/lib/nav.tsx` (`primary: true` puts it in the 5-slot mobile tab bar).
- Typed routes are on (`typedRoutes: true`) — new routes must exist before you
  link to them.
