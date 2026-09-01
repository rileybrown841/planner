-- ============================================================================
-- Phase 4 follow-up — semester break periods + repeating-event end dates
-- ============================================================================

-- Named no-class stretches (Spring Break, reading week…). Each entry is
-- { name: text, start: "YYYY-MM-DD", end: "YYYY-MM-DD" } (both ends inclusive).
-- Class meeting occurrences on these dates are hidden from the calendar.
alter table semesters
  add column if not exists breaks jsonb not null default '[]'::jsonb;

-- Last day a recurring event may produce an occurrence. null ⇒ repeats forever.
alter table events
  add column if not exists recurrence_until date;

-- The existing owner-only RLS policies (`<table>_owner_all`) already cover the
-- new columns — no policy changes needed.
