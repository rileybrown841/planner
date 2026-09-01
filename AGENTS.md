<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Planner — project notes

Single-user personal planner PWA. Full plan and phased build order in
`projectplan.md`. Phases 1–6 done; build subsequent phases in order.
Repo `github.com/rileybrown841/planner` (`main`). Migrations `0001`, `0002`
applied (0002 via MCP `apply_migration`).

## Phase 6 (dashboard)

`/today` is the dashboard (PWA start_url). Page fetches `getDashboardData()`
(`src/lib/data/dashboard.ts` = `getCalendarSources()` + `countOpenTasks()`) and
hands it to `<Dashboard>` (client) which computes everything in the viewer's
timezone: 3 stat tiles (`<StatTile>`), a Today panel (reuses `<TodaySchedule>` +
`<DueSoon>`), and `<ComingUp>` (next-7-days all-day items via
`buildCalendarItems`, grouped by day). When Phase 7 lands, add a habits section
to `<Dashboard>`.

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
