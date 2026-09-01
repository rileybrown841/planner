"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { SemesterBreak } from "@/lib/types";
import { controlClass } from "@/components/ui/form-field";
import { buttonClass } from "@/components/ui/button";

type Row = { key: number; brk: Partial<SemesterBreak> };

let nextKey = 0;
const makeRow = (brk: Partial<SemesterBreak> = {}): Row => ({ key: nextKey++, brk });

export function BreaksEditor({
  defaultValue = [],
  error,
}: {
  defaultValue?: SemesterBreak[];
  error?: string;
}) {
  const [rows, setRows] = useState<Row[]>(
    defaultValue.length ? defaultValue.map((b) => makeRow(b)) : [],
  );

  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && (
        <p className="text-xs text-zinc-500">No breaks yet.</p>
      )}

      {rows.map((r) => (
        <div
          key={r.key}
          className="flex flex-col gap-2 rounded-lg border border-black/10 p-2 dark:border-white/10"
        >
          <div className="flex items-center gap-2">
            <input
              name="break-name"
              defaultValue={r.brk.name ?? ""}
              placeholder="Spring Break"
              aria-label="Break name"
              className={controlClass}
            />
            <button
              type="button"
              aria-label="Remove break"
              onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
              className="focus-ring grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="break-start"
              defaultValue={r.brk.start ?? ""}
              aria-label="Break start date"
              className={controlClass}
            />
            <span className="text-zinc-400">–</span>
            <input
              type="date"
              name="break-end"
              defaultValue={r.brk.end ?? ""}
              aria-label="Break end date"
              className={controlClass}
            />
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, makeRow()])}
        className={buttonClass({ variant: "secondary", size: "sm", className: "self-start" })}
      >
        <Plus className="size-4" />
        Add break
      </button>
    </div>
  );
}
