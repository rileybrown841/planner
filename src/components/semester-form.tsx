"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Route } from "next";
import type { Semester } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { BreaksEditor } from "@/components/breaks-editor";

export function SemesterForm({
  action,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValue?: Semester;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name} hint='e.g. "Fall 2026"'>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValue?.name}
          className={controlClass}
        />
      </FormField>

      <div className="flex gap-3">
        <FormField label="Start date" htmlFor="start_date" error={state.fieldErrors?.start_date} optional className="flex-1">
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={defaultValue?.start_date ?? ""}
            className={controlClass}
          />
        </FormField>
        <FormField label="End date" htmlFor="end_date" error={state.fieldErrors?.end_date} optional className="flex-1">
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={defaultValue?.end_date ?? ""}
            className={controlClass}
          />
        </FormField>
      </div>

      <FormField
        label="Breaks"
        error={state.fieldErrors?.breaks}
        hint="Class meetings are hidden on these dates (e.g. Spring Break)."
        optional
      >
        <BreaksEditor defaultValue={defaultValue?.breaks} />
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
