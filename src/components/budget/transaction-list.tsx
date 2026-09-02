"use client";

import { useMemo } from "react";
import type { TransactionWithCategory } from "@/lib/types";
import { groupByMonth, monthLabel } from "@/lib/budget";
import { formatMoney } from "@/lib/money";
import { TransactionRow } from "@/components/budget/transaction-row";

export function TransactionList({ transactions }: { transactions: TransactionWithCategory[] }) {
  const months = useMemo(() => groupByMonth(transactions), [transactions]);

  if (months.length === 0) {
    return <p className="text-sm text-zinc-500">No transactions yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {months.map((m) => (
        <section key={m.month}>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {monthLabel(m.month)}
            </h2>
            <span className="text-xs tabular-nums text-zinc-500">
              −{formatMoney(m.spent)}
              {m.income > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400"> · +{formatMoney(m.income)}</span>
              )}
            </span>
          </div>
          <ul className="flex flex-col">
            {m.transactions.map((t) => (
              <TransactionRow key={t.id} txn={t} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
