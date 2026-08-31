"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { Route } from "next";
import type { ClassPickerGroup } from "@/lib/data/classes";
import type { Extracurricular, TaskWithLinks } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/priority";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { LinkPicker } from "@/components/link-picker";

/** Split a stored ISO due date into local date + time inputs (23:59 = "no time"). */
function splitDue(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const noTime = d.getHours() === 23 && d.getMinutes() === 59;
  return { date, time: noTime ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

function initialLink(task?: TaskWithLinks): string {
  if (task?.class_id) return `class:${task.class_id}`;
  if (task?.extracurricular_id) return `activity:${task.extracurricular_id}`;
  return "";
}

export function TaskForm({
  action,
  classGroups,
  activities,
  defaultValue,
  submitLabel,
  cancelHref,
  showStatus = false,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  classGroups: ClassPickerGroup[];
  activities: Pick<Extracurricular, "id" | "name">[];
  defaultValue?: TaskWithLinks;
  submitLabel: string;
  cancelHref: Route;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);
  const seed = splitDue(defaultValue?.due_date ?? null);
  const [date, setDate] = useState(seed.date);
  const [time, setTime] = useState(seed.time);

  const dueAt = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time ? time.split(":").map(Number) : [23, 59];
    return new Date(y, m - 1, d, hh, mm).toISOString();
  }, [date, time]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="due_at" value={dueAt} />

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

      <FormField label="Notes" htmlFor="description" error={state.fieldErrors?.description} optional>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValue?.description ?? ""}
          className={controlClass}
        />
      </FormField>

      <div className="flex flex-wrap gap-3">
        <FormField label="Due date" htmlFor="due-date" optional className="flex-1">
          <input
            id="due-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={controlClass}
          />
        </FormField>
        <FormField label="Time" htmlFor="due-time" optional className="flex-1">
          <input
            id="due-time"
            type="time"
            value={time}
            disabled={!date}
            onChange={(e) => setTime(e.target.value)}
            className={controlClass}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-3">
        <FormField label="Priority" htmlFor="priority" className="flex-1">
          <select
            id="priority"
            name="priority"
            defaultValue={defaultValue?.priority ?? "medium"}
            className={controlClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </FormField>

        {showStatus && (
          <FormField label="Status" htmlFor="status" className="flex-1">
            <select
              id="status"
              name="status"
              defaultValue={defaultValue?.status ?? "todo"}
              className={controlClass}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
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
