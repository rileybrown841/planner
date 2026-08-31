"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { ClassPickerGroup } from "@/lib/data/classes";
import type { Extracurricular } from "@/lib/types";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/priority";
import { cn } from "@/lib/cn";

const selectClass =
  "rounded-lg border border-black/15 bg-white py-1.5 pl-2.5 pr-7 text-sm outline-none focus:border-indigo-500 dark:border-white/15 dark:bg-white/5";

export function TaskFilters({
  classGroups,
  activities,
}: {
  classGroups: ClassPickerGroup[];
  activities: Pick<Extracurricular, "id" | "name">[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const linkValue = params.get("class")
    ? `class:${params.get("class")}`
    : params.get("activity")
      ? `activity:${params.get("activity")}`
      : "";
  const priority = params.get("priority") ?? "";
  const hasFilters = Boolean(linkValue || priority);

  function apply(next: URLSearchParams) {
    next.delete("error");
    const qs = next.toString();
    router.push(qs ? `/tasks?${qs}` : "/tasks");
  }

  function onLinkChange(value: string) {
    const next = new URLSearchParams(params);
    next.delete("class");
    next.delete("activity");
    if (value.startsWith("class:")) next.set("class", value.slice(6));
    else if (value.startsWith("activity:")) next.set("activity", value.slice(9));
    apply(next);
  }

  function onPriorityChange(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set("priority", value);
    else next.delete("priority");
    apply(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by class or activity"
        value={linkValue}
        onChange={(e) => onLinkChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All classes &amp; activities</option>
        {classGroups.map((g) => (
          <optgroup key={g.semesterId} label={g.semesterName}>
            {g.classes.map((c) => (
              <option key={c.id} value={`class:${c.id}`}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
        {activities.length > 0 && (
          <optgroup label="Activities">
            {activities.map((a) => (
              <option key={a.id} value={`activity:${a.id}`}>
                {a.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      <select
        aria-label="Filter by priority"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className={selectClass}
      >
        <option value="">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => router.push("/tasks")}
        className={cn(
          "inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
          !hasFilters && "invisible",
        )}
      >
        <X className="size-3.5" />
        Clear
      </button>
    </div>
  );
}
