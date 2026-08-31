/**
 * Absolute base URL of the app, used to build the magic-link redirect target.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL  — set this to your real domain in production
 *  2. VERCEL_URL            — auto-set by Vercel for preview deployments
 *  3. http://localhost:3000 — local dev fallback
 */
export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "http://localhost:3000";

  if (!url.startsWith("http")) url = `https://${url}`;
  return url.replace(/\/$/, "");
}
