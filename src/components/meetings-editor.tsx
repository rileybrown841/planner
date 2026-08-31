"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ClassMeeting } from "@/lib/types";
import { DAY_KEYS, DAY_LABELS } from "@/lib/days";
import { controlClass } from "@/components/ui/form-field";
import { buttonClass } from "@/components/ui/button";

type Row = { key: number; meeting: Partial<ClassMeeting> };

let nextKey = 0;
const row = (meeting: Partial<ClassMeeting> = {}): Row => ({ key: nextKey++, meeting });

export function MeetingsEditor({
  defaultValue = [],
  error,
}: {
  defaultValue?: ClassMeeting[];
  error?: string;
}) {
  const [rows, setRows] = useState<Row[]>(
    defaultValue.length ? defaultValue.map((m) => row(m)) : [],
  );

  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && (
        <p className="text-xs text-zinc-500">No recurring meetings yet.</p>
      )}

      {rows.map(({ key, meeting }) => (
        <div key={key} className="flex items-center gap-2">
          <select
            name="meeting-day"
            defaultValue={meeting.day ?? "mon"}
            aria-label="Day"
            className={controlClass}
          >
            {DAY_KEYS.map((d) => (
              <option key={d} value={d}>
                {DAY_LABELS[d]}
              </option>
            ))}
          </select>
          <input
            type="time"
            name="meeting-start"
            defaultValue={meeting.start ?? "09:00"}
            aria-label="Start time"
            className={controlClass}
          />
          <span className="text-zinc-400">–</span>
          <input
            type="time"
            name="meeting-end"
            defaultValue={meeting.end ?? "09:50"}
            aria-label="End time"
            className={controlClass}
          />
          <button
            type="button"
            aria-label="Remove meeting"
            onClick={() => setRows((rs) => rs.filter((r) => r.key !== key))}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, row()])}
        className={buttonClass({ variant: "secondary", size: "sm", className: "self-start" })}
      >
        <Plus className="size-4" />
        Add meeting time
      </button>
    </div>
  );
}
