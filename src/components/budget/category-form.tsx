"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Route } from "next";
import type { BudgetCategory } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { ColorPicker } from "@/components/color-picker";

export function CategoryForm({
  action,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValue?: BudgetCategory;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-5">
      <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name} hint='e.g. "Groceries"'>
        <input id="name" name="name" required autoFocus defaultValue={defaultValue?.name} className={controlClass} />
      </FormField>

      <FormField
        label="Monthly limit"
        htmlFor="monthly_limit"
        error={state.fieldErrors?.monthly_limit}
        hint="How much you plan to spend here each month. 0 = just track it."
      >
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">$</span>
          <input
            id="monthly_limit"
            name="monthly_limit"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            defaultValue={defaultValue?.monthly_limit ?? ""}
            placeholder="300"
            className={controlClass}
          />
        </div>
      </FormField>

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
