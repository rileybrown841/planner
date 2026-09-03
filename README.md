# Planner

A personal, single-user digital planner — classes and semesters, fast task
capture, a unified calendar, exam/project countdowns, habit tracking and simple
budgeting. Built as a Progressive Web App so it installs on an iPhone home screen
and works as a normal responsive site on a laptop, with data synced through
Supabase.

See [`projectplan.md`](projectplan.md) for the full product plan and phased build
order.

## Status — all nine phases complete

| Phase | Area | State |
| --- | --- | --- |
| 1 | Next.js 16 + Tailwind v4 + TS, PWA, nav shell; magic-link auth; RLS schema (`0001`) | ✅ |
| 2 | Semesters + classes CRUD; archived = read-only; settings | ✅ |
| 3 | Tasks — quick-add, triage board, filters; extracurriculars CRUD | ✅ |
| 4 | Calendar — month / week / day; events (linked/standalone, recurring); meeting frequency | ✅ |
| 5 | Exam / project tracker — countdowns, done toggle, calendar markers (`0002`); task subtasks | ✅ |
| 6 | Dashboard — `/today`: stat tiles, today's schedule + due tasks, 7-day "Coming up" | ✅ |
| 7 | Habits — counter / checklist habits, quick-tap logging, streaks, 30-day history | ✅ |
| 8 | Budgeting — categories with monthly limits, expense/income logging, per-category progress, month summary | ✅ |
| 9 | Polish — green-pastel light/dark theme, Caveat/Nunito type, ⌘K search, perceived-perf + a11y sweep | ✅ |

Migrations `0001` (SQL editor), `0002`–`0004` (via MCP) applied — `0003` adds
semester break periods (`semesters.breaks`) and repeating-event end dates
(`events.recurrence_until`); `0004` adds `skip_dates` for deleting a single
recurring occurrence from the calendar. Phases 7 and 8 needed no migration — the
`habits` / `habit_logs` / `budget_categories` / `transactions` tables were all
already in `0001`.

## Tech stack

- **Next.js 16** App Router. Note: this is a newer Next.js than most references —
  middleware is now `src/proxy.ts`, route type helpers (`PageProps`, `LayoutProps`)
  are generated. See `AGENTS.md`.
- **Supabase** — Postgres + Auth. Row Level Security scoped to `auth.uid()` is the
  data boundary.
- **Tailwind CSS v4**, mobile-first. Green-pastel palette with class-based
  light/dark (`next-themes`); Caveat for large headings, Nunito for body. The
  palette is defined once in `src/app/globals.css` by remapping the `zinc` /
  `indigo` scales, so components use ordinary utility classes.
- **Server Components read; Server Actions mutate** (`revalidatePath` + `redirect`).
  `zod` validates form input. TanStack Query is reserved for later live-logging screens.
- **Vercel** for hosting.

## Local setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. **Project Settings → API**: copy the **Project URL** — just
   `https://<project-ref>.supabase.co`, no `/rest/v1` and no trailing slash — and
   the **publishable** API key (`sb_publishable_…`).
3. **Authentication → Sign In / Providers → Email**: leave Email enabled.
4. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign
   up" — this is a one-person app.
5. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` for now (change to your domain later).
   - Redirect URLs: add `http://localhost:3000/**` (and your production
     `https://your-domain/**` when you deploy).
6. **Authentication → Users → Add user**: create the single account using the
   email you'll sign in with. (Set any password — you'll use magic links, but the
   user has to exist.)

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Var | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from step 2 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key from step 2 |
| `ALLOWED_EMAIL` | The email of the user you created in step 6 |
| `NEXT_PUBLIC_SITE_URL` | Leave blank locally; set to your domain in production |

### 4. Apply the database schema

Not required to boot the app or sign in, but needed once you start Phase 2.

- **Quick way:** open `supabase/migrations/0001_initial_schema.sql`, paste it into
  the Supabase **SQL Editor**, run it.
- **CLI way:** `npx supabase link --project-ref <ref>` then `npx supabase db push`.

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>, enter `ALLOWED_EMAIL`, click the link in the email.

## Deploying to Vercel

Repo: <https://github.com/rileybrown841/planner> (branch `main`).

1. In Vercel: either connect this repo to the existing project (Project →
   Settings → Git → Connect) to keep its URL and env vars, or import fresh at
   [vercel.com/new](https://vercel.com/new). Framework preset: Next.js, no build
   settings to change.
2. **Environment Variables** — set all four from `.env.example`.
   `NEXT_PUBLIC_SITE_URL` must be the real deployment URL
   (e.g. `https://rileysplanner.vercel.app`).
3. In Supabase → **Authentication → URL Configuration**: Site URL = your
   production URL, and add `https://<that-domain>/**` to the redirect URLs.
4. Every push to `main` redeploys automatically.

## Project layout

```
src/
  proxy.ts                  Auth session refresh + route guard (Next 16 "middleware")
  app/
    (app)/                  Signed-in shell — layout gates on requireUser() + <QuickAddFab>
      today/                Greeting + schedule + due tasks + upcoming exams
      calendar/             Month / week / day views (client-expanded recurrence)
      events/               Event CRUD; new/[id]/[id]/edit
      tasks/                Bucketed triage board; [id] has a Steps checklist
      exams/                Exam / project tracker; [id] has a Steps checklist
      extracurriculars/     Clubs/jobs/sports CRUD; [id]/[id]/edit
      habits/               Counter / checklist habits; quick-tap log, streaks, [id] history
      budget/               Month overview + category / transaction CRUD; transactions/ log
      classes/ semesters/   Phase 2 — class & semester CRUD
      settings/             Account + display name
    login/  auth/callback/  Magic-link sign-in + single-user check
    offline/  manifest.ts   PWA offline page + manifest
  components/
    ui/                    button.tsx, form-field.tsx (shared primitives)
    nav/                   Sidebar, bottom tab bar, mobile header (+ ⌘K search button)
    search/                ⌘K command palette (search-palette / search-button)
    settings/              theme-toggle.tsx (Light / System / Dark)
    dashboard/             stat tiles + Today panel + "Coming up" list
    habit/                 habit card / tracker (optimistic quick-tap) / form / history
    budget/                overview / category + transaction forms / progress bars / quick-add
    *-form.tsx *-card.tsx  Semester/class forms, cards, editors
  lib/
    supabase/              client.ts / server.ts / proxy.ts / env.ts
    auth.ts                getUser / requireUser / isAllowedEmail
    data/                  server-only read helpers + guards.ts (archived check) + search.ts
    actions/               Server Actions (semesters, classes, tasks, extracurriculars, habits, budget, calendar, settings, auth)
    schemas.ts form.ts     zod input schemas + ActionResult helpers
    dates.ts priority.ts   client-side task bucket / relative-due + priority helpers
    habits.ts budget.ts    client-safe streak/history and month-rollup maths
    money.ts               $ formatting
    recurrence.ts calendar.ts   recurrence expansion + buildCalendarItems (client-safe)
    routes.ts nav.tsx      typed dynamic-route builders + nav config
supabase/
  migrations/                0001 initial schema, 0002 assessments/subtasks, 0003
                             semester breaks + event end, 0004 occurrence skip_dates (all applied)
public/
  sw.js  icon-*.png        App-shell service worker + PWA icons
```

## How the single-user lock works

- `signInWithOtp` is called with `shouldCreateUser: false`, and public signups are
  disabled in Supabase — so a link can only ever be sent to the one existing user.
- `ALLOWED_EMAIL` is checked again after the magic link is exchanged; any other
  identity is signed straight back out.
- Row Level Security (`auth.uid() = user_id`, `force row level security`) means
  even a leaked key can't read or write another row.

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
