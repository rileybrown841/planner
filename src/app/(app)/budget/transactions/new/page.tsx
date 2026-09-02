import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listBudgetCategories } from "@/lib/data/budget";
import { createTransaction } from "@/lib/actions/budget";
import { TransactionForm } from "@/components/budget/transaction-form";

export const metadata: Metadata = { title: "New transaction" };

export default async function NewTransactionPage() {
  await requireUser();
  const categories = await listBudgetCategories();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">New transaction</h1>
      <TransactionForm
        action={createTransaction}
        categories={categories}
        submitLabel="Add transaction"
        cancelHref="/budget"
      />
    </section>
  );
}
