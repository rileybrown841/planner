import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBudgetCategory } from "@/lib/data/budget";
import { updateBudgetCategory, deleteBudgetCategory } from "@/lib/actions/budget";
import { CategoryForm } from "@/components/budget/category-form";
import { ConfirmSubmit } from "@/components/confirm-submit";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: PageProps<"/budget/categories/[categoryId]/edit">) {
  const { categoryId } = await params;
  const category = await getBudgetCategory(categoryId);
  if (!category) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Edit {category.name}</h1>
      <CategoryForm
        action={updateBudgetCategory.bind(null, category.id)}
        defaultValue={category}
        submitLabel="Save changes"
        cancelHref="/budget"
      />

      <form action={deleteBudgetCategory} className="border-t border-black/10 pt-4 dark:border-white/10">
        <input type="hidden" name="id" value={category.id} />
        <ConfirmSubmit message={`Delete "${category.name}"? Its transactions stay but become uncategorised.`}>
          Delete category
        </ConfirmSubmit>
      </form>
    </section>
  );
}
