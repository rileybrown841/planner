/**
 * Pure, client-safe budget maths. Months are the viewer's local calendar month
 * (`monthKey`), computed on the client, never the server.
 */
import type { BudgetCategory, Transaction, TransactionWithCategory } from "@/lib/types";

/** "YYYY-MM" for a Date, in local time. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** The month a "YYYY-MM-DD" transaction date falls in. */
export function txnMonth(occurredOn: string): string {
  return occurredOn.slice(0, 7);
}

/** "September 2026" for a "YYYY-MM" key. */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export type CategorySpend = {
  category: BudgetCategory;
  spent: number;
  limit: number;
  remaining: number;
  /** 0..100+ — clamp when drawing the bar. */
  pct: number;
  over: boolean;
};

export type MonthSummary = {
  month: string;
  categories: CategorySpend[];
  uncategorisedSpent: number;
  totalSpent: number;
  totalBudgeted: number;
  totalIncome: number;
  net: number;
};

export function monthSummary(
  categories: BudgetCategory[],
  transactions: Transaction[],
  month: string,
): MonthSummary {
  const spentByCat = new Map<string, number>();
  let uncategorisedSpent = 0;
  let totalSpent = 0;
  let totalIncome = 0;

  for (const t of transactions) {
    if (txnMonth(t.occurred_on) !== month) continue;
    if (t.type === "income") {
      totalIncome += t.amount;
      continue;
    }
    totalSpent += t.amount;
    if (t.category_id) {
      spentByCat.set(t.category_id, (spentByCat.get(t.category_id) ?? 0) + t.amount);
    } else {
      uncategorisedSpent += t.amount;
    }
  }

  const cats: CategorySpend[] = categories.map((category) => {
    const spent = spentByCat.get(category.id) ?? 0;
    const limit = category.monthly_limit;
    return {
      category,
      spent,
      limit,
      remaining: limit - spent,
      pct: limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0,
      over: limit > 0 && spent > limit,
    };
  });

  return {
    month,
    categories: cats,
    uncategorisedSpent,
    totalSpent,
    totalBudgeted: categories.reduce((s, c) => s + c.monthly_limit, 0),
    totalIncome,
    net: totalIncome - totalSpent,
  };
}

/** Transactions grouped by month, newest first — for the full log. */
export function groupByMonth(transactions: TransactionWithCategory[]): {
  month: string;
  transactions: TransactionWithCategory[];
  spent: number;
  income: number;
}[] {
  const groups = new Map<string, TransactionWithCategory[]>();
  for (const t of transactions) {
    const key = txnMonth(t.occurred_on);
    const list = groups.get(key);
    if (list) list.push(t);
    else groups.set(key, [t]);
  }

  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, txns]) => ({
      month,
      transactions: txns,
      spent: txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      income: txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    }));
}
