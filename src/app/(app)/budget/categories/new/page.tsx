import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createBudgetCategory } from "@/lib/actions/budget";
import { CategoryForm } from "@/components/budget/category-form";

export const metadata: Metadata = { title: "New category" };

export default async function NewCategoryPage() {
  await requireUser();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">New category</h1>
      <CategoryForm action={createBudgetCategory} submitLabel="Add category" cancelHref="/budget" />
    </section>
  );
}
