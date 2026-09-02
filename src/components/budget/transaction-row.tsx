import Link from "next/link";
import type { TransactionWithCategory } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { editTransactionHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { cn } from "@/lib/cn";

function shortDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TransactionRow({
  txn,
  showDate = true,
}: {
  txn: TransactionWithCategory;
  showDate?: boolean;
}) {
  const income = txn.type === "income";

  return (
    <li>
      <Link
        href={editTransactionHref(txn.id)}
        className="focus-ring flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      >
        {showDate && (
          <span className="w-12 shrink-0 text-xs tabular-nums text-zinc-400">
            {shortDate(txn.occurred_on)}
          </span>
        )}
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={colorDotStyle(income ? "#7cb894" : txn.category?.color)}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">
            {txn.note || txn.category?.name || (income ? "Income" : "Uncategorised")}
          </span>
          {txn.note && txn.category && (
            <span className="truncate text-xs text-zinc-400">{txn.category.name}</span>
          )}
        </span>
        <span
          className={cn(
            "shrink-0 tabular-nums",
            income ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-200",
          )}
        >
          {income ? "+" : "−"}
          {formatMoney(txn.amount)}
        </span>
      </Link>
    </li>
  );
}
