"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { failed, invalid, succeeded, type ActionResult } from "@/lib/form";

const displayNameSchema = z.object({
  display_name: z.string().trim().max(60, "Keep it under 60 characters.").optional(),
});

export async function updateDisplayName(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();

  const parsed = displayNameSchema.safeParse({
    display_name: formData.get("display_name"),
  });
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { display_name: parsed.data.display_name ?? null },
  });
  if (error) return failed(error.message);

  revalidatePath("/", "layout");
  return succeeded("Saved.");
}
