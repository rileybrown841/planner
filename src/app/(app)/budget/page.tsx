import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getBudgetData } from "@/lib/data/budget";
import { buttonClass } from "@/components/ui/button";
import { BudgetOverview } from "@/components/budget/budget-overview";
import { QuickTransaction } from "@/components/budget/quick-transaction";

export const metadata: Metadata = { title: "Budget" };

export default async function BudgetPage({ searchParams }: PageProps<"/budget">) {
  const [{ categories, transactions }, params] = await Promise.all([getBudgetData(), searchParams]);
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Budget</h1>
          <p className="text-sm text-zinc-500">This month at a glance.</p>
        </div>
        <Link href="/budget/transactions/new" className={buttonClass()}>
          <Plus className="size-4" />
          Add transaction
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {categories.length > 0 && (
        <div className="rounded-xl border border-black/10 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.02]">
          <QuickTransaction categories={categories} />
        </div>
      )}

      {categories.length === 0 && transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-white/[0.02]">
          Start by adding a category with a monthly limit, then log what you spend against it.
          <div className="mt-3">
            <Link href="/budget/categories/new" className={buttonClass({ size: "sm" })}>
              <Plus className="size-4" />
              Add a category
            </Link>
          </div>
        </div>
      ) : (
        <BudgetOverview categories={categories} transactions={transactions} />
      )}
    </section>
  );
}
