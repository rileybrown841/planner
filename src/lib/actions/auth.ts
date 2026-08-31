"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/auth";
import { getSiteURL } from "@/lib/site-url";
import { describeSupabaseConfigProblem } from "@/lib/config";

export type SignInState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

/**
 * Emails a magic link to the owner. `shouldCreateUser: false` means links are
 * only ever sent to the one account that already exists in Supabase, so this
 * form can't be used to provision new users.
 */
export async function signInWithMagicLink(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/today");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  // Don't even send a link to an address that isn't the owner.
  if (!isAllowedEmail(email)) {
    return {
      status: "error",
      message: "That address isn't set up for this planner.",
    };
  }

  const configProblem = describeSupabaseConfigProblem();
  if (configProblem) {
    return { status: "error", message: configProblem };
  }

  const supabase = await createClient();
  const redirectTo = `${getSiteURL()}/auth/callback?next=${encodeURIComponent(next)}`;

  let error;
  try {
    ({ error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    }));
  } catch (err) {
    return { status: "error", message: explainAuthError(errText(err)) };
  }

  if (error) {
    return { status: "error", message: explainAuthError(error.message) };
  }

  return { status: "sent", message: `Check ${email} for your sign-in link.` };
}

function errText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Turn raw Supabase/network errors into something actionable for the owner. */
function explainAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid path") || m.includes("<") || m.includes("not valid json")) {
    return `Supabase rejected the request path. Check NEXT_PUBLIC_SUPABASE_URL is exactly https://<project-ref>.supabase.co with no trailing slash or path. (${raw})`;
  }
  if (m.includes("fetch failed") || m.includes("enotfound") || m.includes("getaddrinfo")) {
    return `Couldn't reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and your connection. (${raw})`;
  }
  if (m.includes("signups not allowed") || m.includes("otp_disabled")) {
    return "No user exists for that email yet. Create it in Supabase → Authentication → Users first.";
  }
  if (m.includes("invalid api key") || m.includes("apikey")) {
    return "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks wrong — copy the publishable key from Project Settings → API Keys.";
  }
  return raw;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
