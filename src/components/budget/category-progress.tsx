import Link from "next/link";
import type { CategorySpend } from "@/lib/budget";
import { formatMoney } from "@/lib/money";
import { editCategoryHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { cn } from "@/lib/cn";

export function CategoryProgress({ spend }: { spend: CategorySpend }) {
  const { category, spent, limit, remaining, pct, over } = spend;
  const width = Math.min(100, Math.max(0, pct));
  const near = !over && pct >= 80;

  return (
    <li>
      <Link
        href={editCategoryHref(category.id)}
        className="focus-ring flex flex-col gap-1.5 rounded-lg px-1 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={colorDotStyle(category.color)} />
          <span className="truncate font-medium">{category.name}</span>
          <span className="ml-auto shrink-0 tabular-nums text-zinc-500">
            {formatMoney(spent)}
            {limit > 0 && <span className="text-zinc-400"> / {formatMoney(limit)}</span>}
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              over ? "bg-red-500" : near ? "bg-amber-500" : "bg-indigo-500",
            )}
            style={{ width: `${width}%` }}
          />
        </div>

        {limit > 0 && (
          <p className={cn("text-xs", over ? "text-red-600 dark:text-red-400" : "text-zinc-500")}>
            {over
              ? `${formatMoney(-remaining)} over`
              : `${formatMoney(remaining)} left`}
          </p>
        )}
      </Link>
    </li>
  );
}
