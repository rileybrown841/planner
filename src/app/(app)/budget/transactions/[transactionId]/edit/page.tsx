import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTransaction, listBudgetCategories } from "@/lib/data/budget";
import { updateTransaction, deleteTransaction } from "@/lib/actions/budget";
import { TransactionForm } from "@/components/budget/transaction-form";
import { ConfirmSubmit } from "@/components/confirm-submit";

export const metadata: Metadata = { title: "Edit transaction" };

export default async function EditTransactionPage({
  params,
}: PageProps<"/budget/transactions/[transactionId]/edit">) {
  const { transactionId } = await params;
  const [transaction, categories] = await Promise.all([
    getTransaction(transactionId),
    listBudgetCategories(),
  ]);
  if (!transaction) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Edit transaction</h1>
      <TransactionForm
        action={updateTransaction.bind(null, transaction.id)}
        categories={categories}
        defaultValue={transaction}
        submitLabel="Save changes"
        cancelHref="/budget/transactions"
      />

      <form action={deleteTransaction} className="border-t border-black/10 pt-4 dark:border-white/10">
        <input type="hidden" name="id" value={transaction.id} />
        <ConfirmSubmit message="Delete this transaction?">Delete transaction</ConfirmSubmit>
      </form>
    </section>
  );
}
