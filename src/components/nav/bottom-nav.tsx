"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_ITEMS, isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 flex items-stretch border-t border-black/10 bg-white/90 backdrop-blur-sm md:hidden dark:border-white/10 dark:bg-black/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {PRIMARY_NAV_ITEMS.map((item) => {
        const { href, label, icon: Icon } = item;
        const active = isNavItemActive(pathname, item);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[0.7rem] font-medium transition-colors",
              active
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
