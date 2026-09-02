"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BudgetCategory, TransactionWithCategory } from "@/lib/types";
import { monthKey, monthLabel, monthSummary, txnMonth } from "@/lib/budget";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { cn } from "@/lib/cn";
import { CategoryProgress } from "@/components/budget/category-progress";
import { TransactionRow } from "@/components/budget/transaction-row";

const RECENT = 8;

function Tile({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-black/10 bg-white/60 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      <span
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "warn" && "text-red-600 dark:text-red-400",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function BudgetOverview({
  categories,
  transactions,
}: {
  categories: BudgetCategory[];
  transactions: TransactionWithCategory[];
}) {
  const [month] = useState(() => monthKey(new Date()));

  const summary = useMemo(
    () => monthSummary(categories, transactions, month),
    [categories, transactions, month],
  );

  const sortedCats = useMemo(
    () => [...summary.categories].sort((a, b) => b.pct - a.pct),
    [summary.categories],
  );

  const recent = useMemo(
    () => transactions.filter((t) => txnMonth(t.occurred_on) === month).slice(0, RECENT),
    [transactions, month],
  );

  const remaining = summary.totalBudgeted - summary.totalSpent;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-medium text-zinc-500">{monthLabel(month)}</p>

      <div className="grid grid-cols-3 gap-3">
        <Tile label="Spent" value={formatMoneyShort(summary.totalSpent)} />
        <Tile label="Budgeted" value={formatMoneyShort(summary.totalBudgeted)} />
        <Tile
          label={remaining < 0 ? "Over" : "Left"}
          value={formatMoneyShort(Math.abs(remaining))}
          tone={remaining < 0 ? "warn" : undefined}
        />
      </div>

      {summary.totalIncome > 0 && (
        <p className="text-sm text-zinc-500">
          Income {formatMoney(summary.totalIncome)} · Net{" "}
          <span className={cn("font-medium", summary.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
            {summary.net >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(summary.net))}
          </span>
        </p>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Categories</h2>
          <Link href="/budget/categories/new" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
            Add category
          </Link>
        </div>
        {summary.categories.length === 0 ? (
          <p className="text-sm text-zinc-500">No categories yet. Add one to set a monthly limit.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sortedCats.map((s) => (
              <CategoryProgress key={s.category.id} spend={s} />
            ))}
            {summary.uncategorisedSpent > 0 && (
              <li className="flex items-center gap-2 px-1 py-1.5 text-sm text-zinc-500">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                Uncategorised
                <span className="ml-auto tabular-nums">{formatMoney(summary.uncategorisedSpent)}</span>
              </li>
            )}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">This month</h2>
          <Link href="/budget/transactions" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
            All transactions →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing logged this month yet.</p>
        ) : (
          <ul className="flex flex-col">
            {recent.map((t) => (
              <TransactionRow key={t.id} txn={t} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
