import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// In Next.js 16 this file replaces `middleware.ts`. It keeps the Supabase auth
// session fresh and guards protected routes. See:
// https://nextjs.org/docs/app/getting-started/proxy
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything except Next internals and static asset requests.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
