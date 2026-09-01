-- ============================================================================
-- Phase 4 follow-up — cancel a single recurring occurrence from the calendar
-- ============================================================================

-- "YYYY-MM-DD" dates on which one meeting / event occurrence was cancelled.
-- `buildCalendarItems` filters these out; the rest of the series is unaffected.
alter table classes
  add column if not exists skip_dates jsonb not null default '[]'::jsonb;

alter table extracurriculars
  add column if not exists skip_dates jsonb not null default '[]'::jsonb;

alter table events
  add column if not exists skip_dates jsonb not null default '[]'::jsonb;

-- The existing owner-only RLS policies (`<table>_owner_all`) already cover the
-- new columns — no policy changes needed.
