import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { listTransactions } from "@/lib/data/budget";
import { buttonClass } from "@/components/ui/button";
import { TransactionList } from "@/components/budget/transaction-list";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage({ searchParams }: PageProps<"/budget/transactions">) {
  const [transactions, params] = await Promise.all([listTransactions(), searchParams]);
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/budget"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        Budget
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Transactions</h1>
        <Link href="/budget/transactions/new" className={buttonClass({ size: "sm" })}>
          <Plus className="size-4" />
          Add
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <TransactionList transactions={transactions} />
    </section>
  );
}
