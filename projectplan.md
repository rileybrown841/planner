# Personal Digital Planner — Project Plan

## Overview

A personal, single-user digital planner web app for a university student juggling multiple classes (across semesters), extracurriculars, fast-arriving tasks, and personal habit goals (water, food, budgeting). Must work seamlessly on a Windows laptop (browser) and an iPhone (installed as a home-screen app), with automatic sync between devices.

This is a **single-user personal tool** — no multi-tenant auth complexity, no public sign-up flow, no admin dashboard needed. Just one account (the owner) accessing their own data from two devices.

## Goals

- Never lose track of a fast-incoming task or deadline.
- One glance in the morning tells the user everything relevant to *today*.
- Reduce the mental overhead of tracking classes + extracurriculars + personal life across multiple semesters.
- Build small, low-friction habit-tracking (water, food, budget) that doesn't feel like a chore.
- Fast, lightweight, and pleasant to use on the go (phone) as well as at a desk (laptop).

## Tech Stack

- **Frontend/Framework:** Next.js (App Router), deployed as a **Progressive Web App (PWA)** — installable on iPhone home screen (full-screen, app-like) and usable as a normal responsive website on Windows/desktop browsers. No separate native iOS codebase needed.
- **Backend/Database:** Supabase (managed Postgres + auth + realtime). Handles automatic cross-device sync via realtime subscriptions or simple refetch-on-focus.
- **Auth:** Supabase Auth, single user account (email/password or magic link). No multi-user support needed — but built on real auth so it's secure and could extend later if desired.
- **Hosting/Deployment:** Vercel (auto-deploys from GitHub, effectively zero maintenance).
- **Styling:** Tailwind CSS, mobile-first responsive design.
- **State/data fetching:** React Query (or SWR) for client-side caching + sync-on-reconnect behavior.

## Architecture Notes

- Single Next.js repo; API routes (or direct Supabase client calls with row-level security) handle all data operations.
- Row-level security (RLS) in Supabase scoped to the single user's `auth.uid()` — good practice even for a single-user app, and free with Supabase.
- PWA manifest + service worker for installability and basic offline resilience (cached shell; queued writes optional stretch goal — see below).
- Design mobile-first, since day-to-day quick task capture and habit logging will mostly happen on the phone; laptop is more for calendar/planning views.

## Data Model (high-level)

- **Semesters**: id, name (e.g. "Fall 2026"), start_date, end_date, is_active, is_archived (archived semesters and all their linked data become read-only in the UI)
- **Classes**: id, semester_id, name, code, instructor, color, schedule (recurring meeting times), location
- **Extracurriculars**: id, name, color, type (club/job/sport/etc.), recurring meeting schedule (optional)
- **Events**: id, title, date/time, linked_to (class_id / extracurricular_id / none), location, notes, recurrence rule (optional)
- **Tasks**: id, title, description, due_date, priority (low/med/high/urgent), status (todo/in-progress/done), linked_to (class_id / extracurricular_id / none), created_at (for fast-triage sorting)
- **Exams/Projects**: id, title, class_id, due_date, type (exam/project), subtasks (linked tasks), notes
- **Habits**: id, name, type (counter e.g. water / checklist e.g. "ate breakfast"), target (e.g. 8 glasses/day), icon/color
- **Habit Logs**: id, habit_id, date, value (count or boolean), timestamp
- **Budget Categories**: id, name, monthly_limit
- **Transactions**: id, category_id, amount, type (expense/income), date, note

## Features

### 1. Semesters & Classes
- Create/edit/archive semesters; switch the "active" semester context.
- Past (archived) semesters are **read-only**: their classes, events, tasks, and exams/projects can be viewed but not edited or deleted once the semester is archived. Un-archiving (if ever needed) should require an explicit action, not accidental editing.
- Classes belong to a semester: name, code, instructor, color tag, recurring meeting schedule, location.

### 2. Extracurriculars
- Separate category from classes (clubs, jobs, sports, etc.), each with its own color tag and optional recurring schedule.
- Can have linked events and tasks, same as classes.

### 3. Tasks (Quick Capture + Triage)
- **Fast-add**: a prominent, always-accessible "quick add" input (minimal required fields — just a title) so fast-arriving tasks get captured before they're forgotten. Details (due date, priority, linked class) can be filled in later.
- Priority levels and status tracking.
- Tasks can optionally link to a class or extracurricular.
- Filter/sort by due date, priority, or linked category.

### 4. Calendar
- Day / week / month views.
- Merges: class schedules, extracurricular schedules, one-off events, and task due dates into one visual calendar.
- Color-coded by category (class vs. extracurricular vs. personal).
- Recurring event support (weekly classes, standing meetings).

### 5. Day-at-a-Glance Dashboard (home screen)
- What's due today, what's scheduled today, upcoming deadlines in the next few days.
- Habit quick-log widgets front and center (see below).
- Quick stats: e.g. tasks completed this week, current habit streaks.

### 6. Exam / Project Tracker
- Dedicated view of upcoming exams and projects with countdowns.
- Each exam/project can have linked subtasks (e.g., break "Study for Bio midterm" into study sessions) shown as a mini checklist.
- Sorted by urgency (closest deadline first).

### 7. Habit Tracking
- Customizable habits (water, meals, sleep, exercise, etc.).
- **Quick-tap counters** for countable habits (e.g., tap to log a glass of water, running total shown for the day).
- Checklist-style for binary habits (e.g., "took vitamins" — done/not done) where that fits better than a counter.
- Daily streaks and simple history view (e.g., last 7/30 days).

### 8. Budgeting
- Monthly budget categories with a set spending limit per category (e.g., Food: $300/month).
- Log transactions (expense/income) against categories.
- Visual progress against each category's monthly limit (e.g., progress bar, "$180 of $300 used").
- Simple monthly summary (total spent vs. total budgeted).

### 9. Cross-Cutting Features
- Global search/filter across tasks, events, exams, classes, extracurriculars.
- Dark mode.
- In-app reminders/notices (e.g., a banner or badge for things due soon, habit not yet logged today) — **no push notifications for v1** (in-app only).
- Responsive design tuned for one-handed phone use as well as desktop.

## Explicit Non-Goals (v1)

- No multi-user support, sharing, or collaboration features.
- No push notifications (in-app reminders only for now — can revisit later).
- No offline write queueing (nice-to-have stretch goal, not required for v1).
- No full accounting-software-level budgeting (no bank sync, no receipts/OCR).
- No native iOS app via App Store — PWA install only.

## Suggested Build Order (phases)

1. **Foundation**: Next.js + Supabase project setup, auth (single user), PWA manifest/installability, basic navigation shell, deploy pipeline to Vercel.
2. **Core data + Classes/Semesters**: semester and class CRUD, basic settings.
3. **Tasks**: quick-add capture, full task CRUD, priority/status, filtering.
4. **Calendar**: unified calendar view pulling from classes, extracurriculars, events, task due dates.
5. **Exam/Project tracker**: dedicated view + linked subtasks.
6. **Day-at-a-glance dashboard**: home screen pulling everything together.
7. **Habits**: habit CRUD, quick-tap counters, checklist habits, streaks.
8. **Budgeting**: categories, transactions, monthly progress view.
9. **Polish**: dark mode, global search, in-app reminders, responsive/PWA refinement.

## Notes for Claude Code

- This is a personal project for a single user — prioritize simplicity and low maintenance over scalability or enterprise patterns.
- Favor incremental, testable delivery in the phase order above rather than building everything at once.
- Ask clarifying questions before making significant architectural decisions not covered in this plan.
