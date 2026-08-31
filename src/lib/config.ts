/**
 * Small helpers for telling whether the app has been wired up to its backend
 * yet. Used to show setup guidance instead of crashing on a fresh clone.
 *
 * Only `NEXT_PUBLIC_*` vars are referenced here so this module is safe to import
 * from Client Components.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/**
 * Returns a human-readable problem with the Supabase env vars, or `null` if they
 * look plausible. Catches the classic mistake of pasting the app URL into
 * `NEXT_PUBLIC_SUPABASE_URL` instead of the `*.supabase.co` project URL.
 */
export function describeSupabaseConfigProblem(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return "Supabase isn't configured yet.";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL isn't a valid URL ("${url}").`;
  }

  const host = parsed.host;
  const hint =
    "It needs your Supabase project URL — https://<project-ref>.supabase.co, from Project Settings → Data API.";

  if (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1") ||
    /\.vercel\.app$/.test(host)
  ) {
    return `NEXT_PUBLIC_SUPABASE_URL is set to your app (${host}). ${hint}`;
  }

  if (host === "supabase.com" || host === "app.supabase.com") {
    return `NEXT_PUBLIC_SUPABASE_URL is a dashboard link, not the project API. ${hint}`;
  }

  // A trailing slash or an extra path segment (e.g. "/rest/v1/") is tolerated —
  // supabaseUrl() collapses it to the origin — so it isn't flagged here.
  return null;
}

export const APP_NAME = "Planner";
export const APP_DESCRIPTION =
  "A personal planner for classes, tasks, habits and budget — synced across your laptop and phone.";
