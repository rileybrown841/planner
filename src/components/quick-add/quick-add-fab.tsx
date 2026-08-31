"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { QuickAddForm } from "@/components/quick-add/quick-add-form";

/**
 * App-wide fast task capture. Floating "+" bottom-right on every signed-in
 * screen (clear of the mobile tab bar). Opens a modal <dialog> with a
 * title-first form.
 */
export function QuickAddFab() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Quick add task"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 grid size-14 place-items-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="m-auto w-[calc(100vw-2rem)] max-w-md rounded-2xl bg-[var(--background)] p-0 text-[var(--foreground)] backdrop:bg-black/40"
      >
        {open && (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Quick add</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="size-5" />
              </button>
            </div>
            <QuickAddForm onDone={() => setOpen(false)} />
          </div>
        )}
      </dialog>
    </>
  );
}
