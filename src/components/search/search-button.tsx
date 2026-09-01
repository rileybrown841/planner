"use client";

import { Search } from "lucide-react";
import { OPEN_SEARCH_EVENT } from "@/components/search/search-palette";
import { cn } from "@/lib/cn";

/** Opens the ⌘K palette. Used in the sidebar (with a hint) and mobile header (icon only). */
export function SearchButton({ variant = "bar" }: { variant?: "bar" | "icon" }) {
  const open = () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label="Search"
        onClick={open}
        className="focus-ring grid size-10 place-items-center rounded-lg text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
      >
        <Search className="size-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "focus-ring flex w-full items-center gap-2 rounded-lg border border-black/10 px-2.5 py-2 text-sm text-zinc-500 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20",
      )}
    >
      <Search className="size-4" />
      Search
      <kbd className="ml-auto rounded border border-black/10 px-1 text-[0.65rem] text-zinc-400 dark:border-white/10">
        ⌘K
      </kbd>
    </button>
  );
}
