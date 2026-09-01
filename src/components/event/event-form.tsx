"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { Route } from "next";
import type { ClassPickerGroup } from "@/lib/data/classes";
import type { EventWithLinks, Extracurricular } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { FREQ_LABEL } from "@/lib/days";
import { toDateKey } from "@/lib/dates";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { LinkPicker } from "@/components/link-picker";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function splitStart(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return { date: toDateKey(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

function initialLink(ev?: EventWithLinks): string {
  if (ev?.class_id) return `class:${ev.class_id}`;
  if (ev?.extracurricular_id) return `activity:${ev.extracurricular_id}`;
  return "";
}

export function EventForm({
  action,
  classGroups,
  activities,
  defaultValue,
  defaultDate,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  classGroups: ClassPickerGroup[];
  activities: Pick<Extracurricular, "id" | "name">[];
  defaultValue?: EventWithLinks;
  defaultDate?: string;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);

  const start = splitStart(defaultValue?.starts_at ?? null);
  const endSeed = splitStart(defaultValue?.ends_at ?? null);

  const [allDay, setAllDay] = useState(defaultValue?.all_day ?? false);
  const [date, setDate] = useState(start.date || defaultDate || "");
  const [startTime, setStartTime] = useState(start.time || "09:00");
  const [endTime, setEndTime] = useState(endSeed.time || "10:00");
  const [recurrence, setRecurrence] = useState<string>(defaultValue?.recurrence_rule ?? "");

  const { startsAt, endsAt } = useMemo(() => {
    if (!date) return { startsAt: "", endsAt: "" };
    const [y, m, d] = date.split("-").map(Number);
    if (allDay) {
      return { startsAt: new Date(y, m - 1, d, 0, 0).toISOString(), endsAt: "" };
    }
    const [sh, sm] = startTime.split(":").map(Number);
    const s = new Date(y, m - 1, d, sh || 0, sm || 0).toISOString();
    if (!endTime) return { startsAt: s, endsAt: "" };
    const [eh, em] = endTime.split(":").map(Number);
    return { startsAt: s, endsAt: new Date(y, m - 1, d, eh || 0, em || 0).toISOString() };
  }, [date, allDay, startTime, endTime]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="starts_at" value={startsAt} />
      <input type="hidden" name="ends_at" value={endsAt} />

      <FormField label="Title" htmlFor="title" error={state.fieldErrors?.title}>
        <input
          id="title"
          name="title"
          required
          autoFocus
          defaultValue={defaultValue?.title}
          className={controlClass}
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="all_day"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="size-4"
        />
        All day
      </label>

      <div className="flex flex-wrap gap-3">
        <FormField label="Date" htmlFor="date" error={state.fieldErrors?.starts_at} className="flex-1">
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={controlClass}
          />
        </FormField>
        {!allDay && (
          <>
            <FormField label="Start" htmlFor="start-time" className="flex-1">
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={controlClass}
              />
            </FormField>
            <FormField label="End" htmlFor="end-time" error={state.fieldErrors?.ends_at} className="flex-1">
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={controlClass}
              />
            </FormField>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <FormField label="Repeats" htmlFor="recurrence" className="flex-1">
          <select
            id="recurrence"
            name="recurrence"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className={controlClass}
          >
            <option value="">Does not repeat</option>
            <option value="weekly">{FREQ_LABEL.weekly}</option>
            <option value="biweekly">{FREQ_LABEL.biweekly}</option>
            <option value="monthly">{FREQ_LABEL.monthly}</option>
          </select>
        </FormField>
        {recurrence && (
          <FormField
            label="Ends"
            htmlFor="recurrence_until"
            error={state.fieldErrors?.recurrence_until}
            hint="Leave blank to repeat forever."
            className="flex-1"
            optional
          >
            <input
              id="recurrence_until"
              name="recurrence_until"
              type="date"
              defaultValue={defaultValue?.recurrence_until ?? ""}
              className={controlClass}
            />
          </FormField>
        )}
      </div>

      <FormField label="Link to a class or activity" htmlFor="link" optional>
        <LinkPicker
          classGroups={classGroups}
          activities={activities}
          defaultValue={initialLink(defaultValue)}
        />
      </FormField>

      <FormField label="Location" htmlFor="location" error={state.fieldErrors?.location} optional>
        <input
          id="location"
          name="location"
          defaultValue={defaultValue?.location ?? ""}
          className={controlClass}
        />
      </FormField>

      <FormField label="Notes" htmlFor="notes" error={state.fieldErrors?.notes} optional>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValue?.notes ?? ""}
          className={controlClass}
        />
      </FormField>

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonClass({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
