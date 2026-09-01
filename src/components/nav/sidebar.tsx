"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, isNavItemActive, type NavItem } from "@/lib/nav";
import { APP_NAME } from "@/lib/config";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";
import { SearchButton } from "@/components/search/search-button";

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const active = isNavItemActive(pathname, item);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "focus-ring flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-indigo-600/10 text-indigo-700 dark:text-indigo-300"
            : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5",
        )}
      >
        <Icon className="size-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-black/10 bg-white/60 px-3 py-4 md:flex dark:border-white/10 dark:bg-white/[0.02]">
      <Link
        href="/today"
        className="focus-ring mb-4 flex items-center gap-2 rounded-lg px-2 text-lg font-semibold tracking-tight"
      >
        <span
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"
        >
          P
        </span>
        {APP_NAME}
      </Link>

      <div className="mb-3 px-0.5">
        <SearchButton />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(renderItem)}
        <div className="my-2 border-t border-black/10 dark:border-white/10" />
        {SECONDARY_NAV_ITEMS.map(renderItem)}
      </nav>

      <div className="mt-2 border-t border-black/10 pt-3 dark:border-white/10">
        <p className="truncate px-2.5 text-sm font-medium">{name}</p>
        <p className="truncate px-2.5 text-xs text-zinc-500" title={email}>
          {email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="focus-ring mt-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <LogOut className="size-5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
