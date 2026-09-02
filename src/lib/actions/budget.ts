"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { budgetCategorySchema, transactionSchema, type TransactionValues } from "@/lib/schemas";
import { failed, invalid, succeeded, type ActionResult } from "@/lib/form";

function revalidateBudgetViews() {
  revalidatePath("/budget");
  revalidatePath("/budget/transactions");
}

// ── Categories ────────────────────────────────────────────────────────────────

function rawCategory(formData: FormData) {
  return {
    name: formData.get("name"),
    monthly_limit: formData.get("monthly_limit") ?? "0",
    color: formData.get("color") ?? undefined,
  };
}

export async function createBudgetCategory(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = budgetCategorySchema.safeParse(rawCategory(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("budget_categories").insert({
    name: parsed.data.name,
    monthly_limit: parsed.data.monthly_limit,
    color: parsed.data.color,
  });
  if (error) return failed(error.message);

  revalidateBudgetViews();
  redirect("/budget");
}

export async function updateBudgetCategory(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = budgetCategorySchema.safeParse(rawCategory(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("budget_categories")
    .update({
      name: parsed.data.name,
      monthly_limit: parsed.data.monthly_limit,
      color: parsed.data.color,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateBudgetViews();
  redirect("/budget");
}

export async function deleteBudgetCategory(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/budget?error=missing_id");

  const supabase = await createClient();
  // Transactions keep their history; the FK is `on delete set null`.
  const { error } = await supabase.from("budget_categories").delete().eq("id", id);
  if (error) redirect(`/budget?error=${encodeURIComponent(error.message)}`);

  revalidateBudgetViews();
  redirect("/budget");
}

// ── Transactions ─────────────────────────────────────────────────────────────

function rawTransaction(formData: FormData) {
  return {
    amount: formData.get("amount") ?? "",
    type: formData.get("type") ?? "expense",
    category_id: formData.get("category_id") ?? "",
    occurred_on: formData.get("occurred_on") ?? "",
    note: formData.get("note") ?? undefined,
  };
}

function toRow(data: TransactionValues) {
  return {
    amount: data.amount,
    type: data.type,
    category_id: data.category_id,
    occurred_on: data.occurred_on,
    note: data.note,
  };
}

export async function createTransaction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = transactionSchema.safeParse(rawTransaction(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert(toRow(parsed.data));
  if (error) return failed(error.message);

  revalidateBudgetViews();
  redirect("/budget");
}

/** Inline quick-add on the overview — stays on the page. */
export async function createTransactionQuick(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = transactionSchema.safeParse(rawTransaction(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert(toRow(parsed.data));
  if (error) return failed(error.message);

  revalidateBudgetViews();
  return succeeded("Logged.");
}

export async function updateTransaction(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = transactionSchema.safeParse(rawTransaction(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update(toRow(parsed.data)).eq("id", id);
  if (error) return failed(error.message);

  revalidateBudgetViews();
  redirect("/budget/transactions");
}

export async function deleteTransaction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/budget/transactions?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) redirect(`/budget/transactions?error=${encodeURIComponent(error.message)}`);

  revalidateBudgetViews();
  redirect("/budget/transactions");
}
