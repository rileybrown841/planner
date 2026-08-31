-- ============================================================================
-- Planner — initial schema
-- ============================================================================
-- Single-user app. Every row is owned by an `auth.users` id and Row Level
-- Security restricts every operation to `auth.uid() = user_id`. This is the
-- security boundary — the publishable API key is public by design.
--
-- Apply with the Supabase SQL editor, or `supabase db push` with the CLI.
--
-- Phase 1 wires up auth only. The domain tables below are consumed starting in
-- phase 2 (semesters & classes) through phase 8 (budgeting).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status   as enum ('todo', 'in_progress', 'done');
create type activity_type as enum ('club', 'job', 'sport', 'volunteer', 'other');
create type habit_kind    as enum ('counter', 'checklist');
create type assessment_kind as enum ('exam', 'project');
create type txn_type      as enum ('expense', 'income');

-- ---------------------------------------------------------------------------
-- Shared helper: keep `updated_at` current on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Semesters
-- ---------------------------------------------------------------------------
create table semesters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  start_date  date,
  end_date    date,
  is_active   boolean not null default false,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index semesters_user_idx on semesters (user_id);

-- ---------------------------------------------------------------------------
-- Classes (belong to a semester)
-- ---------------------------------------------------------------------------
create table classes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  semester_id uuid not null references semesters (id) on delete cascade,
  name        text not null,
  code        text,
  instructor  text,
  location    text,
  color       text,
  -- Recurring meeting times, e.g. [{ "day": "mon", "start": "09:00", "end": "09:50" }]
  schedule    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index classes_user_idx on classes (user_id);
create index classes_semester_idx on classes (semester_id);

-- ---------------------------------------------------------------------------
-- Extracurriculars (clubs, jobs, sports, …)
-- ---------------------------------------------------------------------------
create table extracurriculars (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null,
  type       activity_type not null default 'other',
  color      text,
  schedule   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index extracurriculars_user_idx on extracurriculars (user_id);

-- ---------------------------------------------------------------------------
-- Events (one-off or recurring; optionally linked to a class or activity)
-- ---------------------------------------------------------------------------
create table events (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title              text not null,
  starts_at          timestamptz not null,
  ends_at            timestamptz,
  all_day            boolean not null default false,
  location           text,
  notes              text,
  -- iCal RRULE string, null for one-off events
  recurrence_rule    text,
  class_id           uuid references classes (id) on delete cascade,
  extracurricular_id uuid references extracurriculars (id) on delete cascade,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint events_single_link check (
    class_id is null or extracurricular_id is null
  )
);
create index events_user_idx on events (user_id);
create index events_starts_at_idx on events (user_id, starts_at);

-- ---------------------------------------------------------------------------
-- Assessments (exams & projects)
-- ---------------------------------------------------------------------------
create table assessments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  class_id   uuid references classes (id) on delete set null,
  title      text not null,
  kind       assessment_kind not null default 'exam',
  due_date   timestamptz,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assessments_user_idx on assessments (user_id);
create index assessments_due_idx on assessments (user_id, due_date);

-- ---------------------------------------------------------------------------
-- Tasks (quick capture + triage). May be a subtask of an assessment.
-- ---------------------------------------------------------------------------
create table tasks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title              text not null,
  description        text,
  due_date           timestamptz,
  priority           task_priority not null default 'medium',
  status             task_status not null default 'todo',
  class_id           uuid references classes (id) on delete set null,
  extracurricular_id uuid references extracurriculars (id) on delete set null,
  assessment_id      uuid references assessments (id) on delete cascade,
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint tasks_single_link check (
    class_id is null or extracurricular_id is null
  )
);
create index tasks_user_idx on tasks (user_id);
create index tasks_triage_idx on tasks (user_id, status, due_date);
create index tasks_assessment_idx on tasks (assessment_id);

-- ---------------------------------------------------------------------------
-- Habits + logs
-- ---------------------------------------------------------------------------
create table habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  kind         habit_kind not null default 'counter',
  target       numeric,               -- e.g. 8 (glasses/day); null for checklist
  unit         text,                  -- e.g. 'glasses'
  icon         text,
  color        text,
  is_archived  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index habits_user_idx on habits (user_id);

create table habit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id   uuid not null references habits (id) on delete cascade,
  log_date   date not null default current_date,
  value      numeric not null default 1,   -- count, or 1/0 for checklist
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);
create index habit_logs_user_idx on habit_logs (user_id);
create index habit_logs_habit_date_idx on habit_logs (habit_id, log_date);

-- ---------------------------------------------------------------------------
-- Budget categories + transactions
-- ---------------------------------------------------------------------------
create table budget_categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null,
  monthly_limit numeric not null default 0,
  color         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index budget_categories_user_idx on budget_categories (user_id);

create table transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid references budget_categories (id) on delete set null,
  amount      numeric not null,
  type        txn_type not null default 'expense',
  occurred_on date not null default current_date,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index transactions_user_idx on transactions (user_id);
create index transactions_date_idx on transactions (user_id, occurred_on);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger trg_semesters_updated        before update on semesters        for each row execute function set_updated_at();
create trigger trg_classes_updated          before update on classes          for each row execute function set_updated_at();
create trigger trg_extracurriculars_updated before update on extracurriculars for each row execute function set_updated_at();
create trigger trg_events_updated           before update on events           for each row execute function set_updated_at();
create trigger trg_assessments_updated      before update on assessments      for each row execute function set_updated_at();
create trigger trg_tasks_updated            before update on tasks            for each row execute function set_updated_at();
create trigger trg_habits_updated           before update on habits           for each row execute function set_updated_at();
create trigger trg_budget_categories_updated before update on budget_categories for each row execute function set_updated_at();
create trigger trg_transactions_updated     before update on transactions     for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — owner-only access on every table
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'semesters', 'classes', 'extracurriculars', 'events', 'assessments',
    'tasks', 'habits', 'habit_logs', 'budget_categories', 'transactions'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format($p$
      create policy %1$I_owner_all on %1$I
        for all
        to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $p$, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Only one active semester at a time (per user)
-- ---------------------------------------------------------------------------
create unique index one_active_semester_per_user
  on semesters (user_id)
  where is_active;

-- ---------------------------------------------------------------------------
-- Archived-semester read-only:
-- Enforced in the app layer (phase 2). If you want a hard DB guarantee later,
-- add BEFORE UPDATE/DELETE triggers on classes/events/assessments/tasks that
-- raise when the linked semester has is_archived = true.
-- ---------------------------------------------------------------------------
