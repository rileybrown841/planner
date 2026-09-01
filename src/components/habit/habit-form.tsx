"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Route } from "next";
import type { Habit, HabitKind } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { ColorPicker } from "@/components/color-picker";
import { cn } from "@/lib/cn";

const KINDS: { value: HabitKind; label: string; hint: string }[] = [
  { value: "counter", label: "Counter", hint: "Tap to add up through the day (water, steps…)" },
  { value: "checklist", label: "Checklist", hint: "One tap: done or not (vitamins, made bed…)" },
];

export function HabitForm({
  action,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValue?: Habit;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);
  const [kind, setKind] = useState<HabitKind>(defaultValue?.kind ?? "counter");

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="kind" value={kind} />

      <div className="flex flex-wrap gap-3">
        <FormField label="Icon" htmlFor="icon" error={state.fieldErrors?.icon} optional className="w-20">
          <input
            id="icon"
            name="icon"
            maxLength={8}
            defaultValue={defaultValue?.icon ?? ""}
            placeholder="💧"
            className={cn(controlClass, "text-center text-lg")}
          />
        </FormField>
        <FormField
          label="Name"
          htmlFor="name"
          error={state.fieldErrors?.name}
          hint='e.g. "Drink water"'
          className="flex-1"
        >
          <input id="name" name="name" required autoFocus defaultValue={defaultValue?.name} className={controlClass} />
        </FormField>
      </div>

      <FormField label="Type">
        <div className="flex flex-col gap-2">
          <div role="radiogroup" aria-label="Habit type" className="inline-flex rounded-lg border border-black/15 p-0.5 dark:border-white/15">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                role="radio"
                aria-checked={kind === k.value}
                onClick={() => setKind(k.value)}
                className={cn(
                  "focus-ring rounded-md px-3 py-1.5 text-sm transition-colors",
                  kind === k.value
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">{KINDS.find((k) => k.value === kind)?.hint}</p>
        </div>
      </FormField>

      {kind === "counter" && (
        <div className="flex flex-wrap gap-3">
          <FormField label="Daily target" htmlFor="target" error={state.fieldErrors?.target} optional className="flex-1">
            <input
              id="target"
              name="target"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              defaultValue={defaultValue?.target ?? ""}
              placeholder="8"
              className={controlClass}
            />
          </FormField>
          <FormField label="Unit" htmlFor="unit" error={state.fieldErrors?.unit} optional className="flex-1">
            <input
              id="unit"
              name="unit"
              defaultValue={defaultValue?.unit ?? ""}
              placeholder="glasses"
              className={controlClass}
            />
          </FormField>
        </div>
      )}

      <FormField label="Colour" error={state.fieldErrors?.color}>
        <ColorPicker defaultValue={defaultValue?.color} />
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
