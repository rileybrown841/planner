import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

/**
 * This is a single-user app. `ALLOWED_EMAIL` is the one account that may sign in;
 * every other authenticated identity is treated as a stranger and rejected.
 */
export function isAllowedEmail(email: string | undefined | null): boolean {
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (!allowed) return false;
  return email?.trim().toLowerCase() === allowed;
}

/**
 * Returns the signed-in user, or `null`. Memoised for the duration of a single
 * render pass so repeated calls don't re-hit the Auth server.
 */
export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAllowedEmail(user.email)) return null;
    return user;
  } catch {
    // Auth server unreachable or misconfigured — treat as signed out rather
    // than 500. requireUser() will bounce to /login.
    return null;
  }
});

/**
 * Use in Server Components / Actions that require a signed-in owner. Redirects
 * to /login when there is no valid session.
 */
export const requireUser = cache(async (): Promise<User> => {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
});
