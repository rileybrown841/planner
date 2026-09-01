"use client";

import type { CalendarItem } from "@/lib/types";
import type { PlacedItem } from "@/lib/calendar-layout";
import { cn } from "@/lib/cn";

/** A timed item positioned in the week/day time grid. Click opens the occurrence popover. */
export function EventBlock({
  placed,
  gridStartMin,
  pxPerMin,
  onSelect,
}: {
  placed: PlacedItem;
  gridStartMin: number;
  pxPerMin: number;
  onSelect: (item: CalendarItem) => void;
}) {
  const { item, startMin, endMin, lane, laneCount } = placed;
  const top = (startMin - gridStartMin) * pxPerMin;
  const height = Math.max((endMin - startMin) * pxPerMin, 16);
  const widthPct = 100 / laneCount;

  const label = item.start
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .replace(":00", "");

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      title={item.title}
      style={{
        top,
        height,
        left: `calc(${lane * widthPct}% + 1px)`,
        width: `calc(${widthPct}% - 2px)`,
        borderLeftColor: item.color ?? "var(--color-zinc-400, #a1a1aa)",
      }}
      className={cn(
        "focus-ring absolute overflow-hidden rounded-r border-l-[3px] bg-black/[0.05] px-1.5 py-0.5 text-left text-[0.7rem] leading-tight text-zinc-700 dark:bg-white/[0.08] dark:text-zinc-100",
        item.kind === "task" && "border-dashed",
      )}
    >
      <span className="block truncate font-medium">{item.title}</span>
      {height > 26 && <span className="block truncate text-zinc-400">{label}</span>}
    </button>
  );
}
