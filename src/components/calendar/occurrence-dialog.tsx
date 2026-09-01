"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import type { CalendarItem } from "@/lib/types";
import { toDateKey } from "@/lib/dates";
import { IDLE_RESULT } from "@/lib/form";
import { cancelOccurrence } from "@/lib/actions/calendar";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";

const CANCELLABLE = new Set(["class", "activity", "event"]);

const dateLong = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
const clock = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(":00", "");

function when(item: CalendarItem): string {
  if (item.allDay) return `${dateLong(item.start)} · all day`;
  if (item.end) return `${dateLong(item.start)} · ${clock(item.start)} – ${clock(item.end)}`;
  return `${dateLong(item.start)} · ${clock(item.start)}`;
}

/** Popover shown when a calendar occurrence is clicked: open its detail page, or delete just this instance. */
export function OccurrenceDialog({
  item,
  onClose,
}: {
  item: CalendarItem | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-[var(--background)] p-0 text-[var(--foreground)] backdrop:bg-black/40"
    >
      {item && <OccurrenceBody key={item.key} item={item} onClose={onClose} />}
    </dialog>
  );
}

function OccurrenceBody({ item, onClose }: { item: CalendarItem; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(cancelOccurrence, IDLE_RESULT);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state, onClose]);

  const cancellable = CANCELLABLE.has(item.kind);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{item.title}</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{when(item)}</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="focus-ring -mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <X className="size-5" />
        </button>
      </div>

      {item.location && (
        <p className="inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
          <MapPin className="size-4 text-zinc-400" />
          {item.location}
        </p>
      )}

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {item.kind !== "break" && (
          <Link href={item.href} className={buttonClass({ variant: "secondary", size: "sm" })}>
            Open details
          </Link>
        )}
        {cancellable && (
          <form action={formAction}>
            <input type="hidden" name="kind" value={item.kind} />
            <input type="hidden" name="id" value={item.sourceId} />
            <input type="hidden" name="date" value={toDateKey(item.start)} />
            <ConfirmSubmit
              message={
                item.recurring
                  ? `Remove just the ${dateLong(item.start)} occurrence of "${item.title}"? Other dates stay.`
                  : `Delete "${item.title}"?`
              }
            >
              {pending ? "Removing…" : item.recurring ? "Delete this occurrence" : "Delete"}
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
