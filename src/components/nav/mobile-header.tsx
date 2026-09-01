"use client";

import Link from "next/link";
import { EllipsisVertical, LogOut } from "lucide-react";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/nav";
import { APP_NAME } from "@/lib/config";
import { signOut } from "@/lib/actions/auth";
import { SearchButton } from "@/components/search/search-button";

// Sections that don't fit in the 5-slot bottom bar live behind this menu.
const MENU_ITEMS = [...NAV_ITEMS.filter((item) => !item.primary), ...SECONDARY_NAV_ITEMS];

export function MobileHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-2.5 backdrop-blur-sm md:hidden dark:border-white/10 dark:bg-black/80">
      <Link href="/today" className="focus-ring flex items-center gap-2 rounded-lg font-semibold tracking-tight">
        <span
          aria-hidden
          className="grid size-6 place-items-center rounded-md bg-indigo-600 text-xs text-white"
        >
          P
        </span>
        {APP_NAME}
      </Link>

      <div className="flex items-center gap-0.5">
        <SearchButton variant="icon" />
        <details className="group relative">
          <summary className="focus-ring grid size-10 cursor-pointer list-none place-items-center rounded-lg text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5">
            <EllipsisVertical className="size-5" />
          </summary>

          <div className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-black/10 bg-[var(--surface)] p-1 shadow-lg dark:border-white/10">
          {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}

          <div className="my-1 border-t border-black/10 dark:border-white/10" />
          <div className="px-3 py-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-zinc-500" title={email}>
              {email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              <LogOut className="size-5" />
              Sign out
            </button>
          </form>
          </div>
        </details>
      </div>
    </header>
  );
}
