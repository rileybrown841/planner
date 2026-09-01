"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Meeting, MeetingFreq } from "@/lib/types";
import { DAY_KEYS, DAY_LABELS, FREQ_LABEL } from "@/lib/days";
import { toDateKey, addDays } from "@/lib/dates";
import { controlClass } from "@/components/ui/form-field";
import { buttonClass } from "@/components/ui/button";

type Row = { key: number; meeting: Partial<Meeting>; freq: MeetingFreq };

let nextKey = 0;
const makeRow = (meeting: Partial<Meeting> = {}): Row => ({
  key: nextKey++,
  meeting,
  freq: meeting.freq ?? "weekly",
});

const FREQS: MeetingFreq[] = ["weekly", "biweekly", "monthly"];

export function MeetingsEditor({
  defaultValue = [],
  error,
  allowFrequency = false,
}: {
  defaultValue?: Meeting[];
  error?: string;
  allowFrequency?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(
    defaultValue.length ? defaultValue.map(makeRow) : [],
  );

  const nextWeek = toDateKey(addDays(new Date(), 7));

  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && (
        <p className="text-xs text-zinc-500">No recurring meetings yet.</p>
      )}

      {rows.map((r) => (
        <div
          key={r.key}
          className="flex flex-col gap-2 rounded-lg border border-black/10 p-2 dark:border-white/10"
        >
          <div className="flex items-center gap-2">
            <select
              name="meeting-day"
              defaultValue={r.meeting.day ?? "mon"}
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
              defaultValue={r.meeting.start ?? "09:00"}
              aria-label="Start time"
              className={controlClass}
            />
            <span className="text-zinc-400">–</span>
            <input
              type="time"
              name="meeting-end"
              defaultValue={r.meeting.end ?? "09:50"}
              aria-label="End time"
              className={controlClass}
            />
            <button
              type="button"
              aria-label="Remove meeting"
              onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>

          {allowFrequency && (
            <div className="flex items-center gap-2">
              <select
                name="meeting-freq"
                value={r.freq}
                aria-label="Repeats"
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x) =>
                      x.key === r.key ? { ...x, freq: e.target.value as MeetingFreq } : x,
                    ),
                  )
                }
                className={controlClass}
              >
                {FREQS.map((f) => (
                  <option key={f} value={f}>
                    {FREQ_LABEL[f]}
                  </option>
                ))}
              </select>
              {r.freq !== "weekly" ? (
                <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-zinc-500">
                  starting
                  <input
                    type="date"
                    name="meeting-anchor"
                    defaultValue={r.meeting.anchor ?? nextWeek}
                    aria-label="Starting date"
                    className={controlClass}
                  />
                </label>
              ) : (
                <input type="hidden" name="meeting-anchor" value="" />
              )}
            </div>
          )}
        </div>
      ))}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, makeRow()])}
        className={buttonClass({ variant: "secondary", size: "sm", className: "self-start" })}
      >
        <Plus className="size-4" />
        Add meeting time
      </button>
    </div>
  );
}
