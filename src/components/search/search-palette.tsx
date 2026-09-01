"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchEntry } from "@/lib/data/search";
import { controlClass } from "@/components/ui/form-field";

export const OPEN_SEARCH_EVENT = "planner:open-search";

export function SearchPalette({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const openIt = () => {
      setOpen(true);
      setQuery("");
      setActive(0);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openIt();
      }
    };
    window.addEventListener(OPEN_SEARCH_EVENT, openIt);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, openIt);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, index]);

  function go(entry: SearchEntry) {
    setOpen(false);
    router.push(entry.href);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false);
      }}
      className="mx-auto mt-[12vh] w-[calc(100vw-2rem)] max-w-lg rounded-2xl bg-[var(--background)] p-0 text-[var(--foreground)] backdrop:bg-black/40"
    >
      {open && (
        <div
          className="flex flex-col"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              go(results[active]);
            }
          }}
        >
          <div className="flex items-center gap-2 border-b border-black/10 p-3 dark:border-white/10">
            <Search className="size-4 shrink-0 text-zinc-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Search tasks, events, exams, classes…"
              className={`${controlClass} border-0 bg-transparent p-0 focus:ring-0`}
            />
          </div>

          {query.trim() && (
            <ul className="max-h-[50vh] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-zinc-500">No matches.</li>
              ) : (
                results.map((entry, i) => (
                  <li key={`${entry.kind}-${entry.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(entry)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                        i === active ? "bg-black/[0.06] dark:bg-white/[0.08]" : ""
                      }`}
                    >
                      <span className="truncate">{entry.title}</span>
                      {entry.subtitle && (
                        <span className="shrink-0 text-xs capitalize text-zinc-400">
                          {entry.subtitle}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 text-xs text-zinc-400">{entry.kind}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </dialog>
  );
}
