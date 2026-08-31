import type { User } from "@supabase/supabase-js";

/**
 * Best display name for the owner: the name they set in Settings (stored in
 * Supabase user metadata), falling back to the local part of their email.
 */
export function displayName(user: Pick<User, "email" | "user_metadata">): string {
  const fromMeta = user.user_metadata?.display_name;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  return user.email?.split("@")[0] ?? "there";
}
