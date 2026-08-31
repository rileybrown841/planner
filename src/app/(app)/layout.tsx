import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { displayName } from "@/lib/user";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { MobileHeader } from "@/components/nav/mobile-header";
import { QuickAddFab } from "@/components/quick-add/quick-add-fab";

// Every screen in here is per-user and auth-gated — never prerender it.
export const dynamic = "force-dynamic";

/**
 * Shell for every signed-in screen: persistent sidebar on desktop, header +
 * bottom tab bar on mobile. `requireUser()` is the real gate — the proxy only
 * does an optimistic redirect.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const email = user.email ?? "";
  const name = displayName(user);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar name={name} email={email} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader name={name} email={email} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-10">
          {children}
        </main>
        <BottomNav />
      </div>

      <QuickAddFab />
    </div>
  );
}
