"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Route } from "next";
import type { BudgetCategory, TransactionWithCategory, TxnType } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { toDateKey } from "@/lib/dates";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function TransactionForm({
  action,
  categories,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  categories: BudgetCategory[];
  defaultValue?: TransactionWithCategory;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);
  const [type, setType] = useState<TxnType>(defaultValue?.type ?? "expense");
  const [today] = useState(() => toDateKey(new Date()));

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-5">
      <input type="hidden" name="type" value={type} />

      <FormField label="Type">
        <div className="flex rounded-lg border border-black/15 p-0.5 text-sm dark:border-white/15">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 capitalize",
                t === type
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Amount" htmlFor="amount" error={state.fieldErrors?.amount}>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">$</span>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            autoFocus
            defaultValue={defaultValue?.amount ?? ""}
            placeholder="12.50"
            className={controlClass}
          />
        </div>
      </FormField>

      <FormField label="Category" htmlFor="category_id" error={state.fieldErrors?.category_id} optional>
        <select
          id="category_id"
          name="category_id"
          defaultValue={defaultValue?.category_id ?? ""}
          className={controlClass}
        >
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Date" htmlFor="occurred_on" error={state.fieldErrors?.occurred_on}>
        <input
          id="occurred_on"
          name="occurred_on"
          type="date"
          required
          defaultValue={defaultValue?.occurred_on ?? today}
          className={controlClass}
        />
      </FormField>

      <FormField label="Note" htmlFor="note" error={state.fieldErrors?.note} optional>
        <input id="note" name="note" defaultValue={defaultValue?.note ?? ""} className={controlClass} />
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
