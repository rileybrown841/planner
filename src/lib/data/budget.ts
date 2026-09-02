import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { BudgetCategory, TransactionWithCategory } from "@/lib/types";

const TXN_SELECT = "*, category:budget_categories(id, name, color)";

export const listBudgetCategories = cache(async (): Promise<BudgetCategory[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .order("name", { ascending: true })
    .returns<BudgetCategory[]>();

  if (error) throw error;
  return data ?? [];
});

export const getBudgetCategory = cache(async (id: string): Promise<BudgetCategory | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle<BudgetCategory>();

  if (error) throw error;
  return data ?? null;
});

/**
 * Every transaction, newest first, with its category. The table stays modest
 * for one user, and month rollups run client-side against the viewer's calendar.
 */
export const listTransactions = cache(async (): Promise<TransactionWithCategory[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(TXN_SELECT)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<TransactionWithCategory[]>();

  if (error) throw error;
  return data ?? [];
});

export const getTransaction = cache(async (id: string): Promise<TransactionWithCategory | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(TXN_SELECT)
    .eq("id", id)
    .maybeSingle<TransactionWithCategory>();

  if (error) throw error;
  return data ?? null;
});

export type BudgetData = {
  categories: BudgetCategory[];
  transactions: TransactionWithCategory[];
};

/** Categories + all transactions — for the overview and the transaction log. */
export const getBudgetData = cache(async (): Promise<BudgetData> => {
  await requireUser();
  const [categories, transactions] = await Promise.all([
    listBudgetCategories(),
    listTransactions(),
  ]);
  return { categories, transactions };
});
