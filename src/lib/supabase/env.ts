/**
 * Reads and normalises the public Supabase env vars.
 *
 * A Supabase project URL is always a bare origin (`https://<ref>.supabase.co`).
 * People routinely paste it with a trailing slash or an extra path segment
 * (`/rest/v1`, `/dashboard/...`), which makes supabase-js build request URLs
 * like `.../rest/v1/auth/v1/otp` → "Invalid path specified in request URL".
 * Collapsing to `.origin` here removes that whole class of mistake.
 *
 * Safe to import from Client Components — only `NEXT_PUBLIC_*` is read.
 */
export function supabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  try {
    return new URL(raw).origin;
  } catch {
    return raw;
  }
}

export function supabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
}
