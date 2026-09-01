"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { Route } from "next";
import type { ClassPickerGroup } from "@/lib/data/classes";
import type { AssessmentWithClass } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");

function splitDue(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const noTime = d.getHours() === 0 && d.getMinutes() === 0;
  return { date, time: noTime ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

export function AssessmentForm({
  action,
  classGroups,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  classGroups: ClassPickerGroup[];
  defaultValue?: AssessmentWithClass;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);
  const seed = splitDue(defaultValue?.due_date ?? null);
  const [kind, setKind] = useState<"exam" | "project">(defaultValue?.kind ?? "exam");
  const [date, setDate] = useState(seed.date);
  const [time, setTime] = useState(seed.time);

  const dueAt = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time ? time.split(":").map(Number) : [0, 0];
    return new Date(y, m - 1, d, hh, mm).toISOString();
  }, [date, time]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="due_at" value={dueAt} />
      <input type="hidden" name="kind" value={kind} />

      <FormField label="Title" htmlFor="title" error={state.fieldErrors?.title}>
        <input
          id="title"
          name="title"
          required
          autoFocus
          defaultValue={defaultValue?.title}
          placeholder="Bio midterm"
          className={controlClass}
        />
      </FormField>

      <FormField label="Type">
        <div className="flex rounded-lg border border-black/15 p-0.5 text-sm dark:border-white/15">
          {(["exam", "project"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 capitalize",
                k === kind
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Class" htmlFor="class_id" error={state.fieldErrors?.class_id} optional>
        <select
          id="class_id"
          name="class_id"
          defaultValue={defaultValue?.class_id ?? ""}
          className={controlClass}
        >
          <option value="">No class</option>
          {classGroups.map((g) => (
            <optgroup key={g.semesterId} label={g.semesterName}>
              {g.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </FormField>

      <div className="flex flex-wrap gap-3">
        <FormField label="Due date" htmlFor="due-date" error={state.fieldErrors?.due_at} className="flex-1">
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
