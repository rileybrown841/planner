-- ============================================================================
-- Phase 5 — exam/project tracker + general task subtasks
-- ============================================================================

-- Mark an exam / project done (drops it to the "Done" section).
alter table assessments
  add column if not exists completed_at timestamptz;

-- Any task can be broken into child steps. Deleting a parent deletes its steps.
alter table tasks
  add column if not exists parent_task_id uuid references tasks (id) on delete cascade;

create index if not exists tasks_parent_idx on tasks (parent_task_id);

-- The existing owner-only RLS policies (`<table>_owner_all`) already cover the
-- new columns — no policy changes needed.
