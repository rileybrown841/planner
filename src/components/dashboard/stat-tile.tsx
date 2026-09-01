import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

export function StatTile({
  label,
  value,
  sublabel,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  href: Route;
  tone?: "default" | "warn";
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-0.5 rounded-xl border border-black/10 bg-white/60 p-3.5 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value}
      </span>
      {sublabel && <span className="truncate text-xs text-zinc-500">{sublabel}</span>}
    </Link>
  );
}
