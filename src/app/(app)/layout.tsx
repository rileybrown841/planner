import { Suspense, type ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { displayName } from "@/lib/user";
import { listClassPickerOptions } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { getSearchIndex } from "@/lib/data/search";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { MobileHeader } from "@/components/nav/mobile-header";
import { QuickAddFab } from "@/components/quick-add/quick-add-fab";
import { SearchPalette } from "@/components/search/search-palette";

// Every screen in here is per-user and auth-gated — never prerender it.
export const dynamic = "force-dynamic";

/**
 * Quick-add picker data + the search index. Behind <Suspense> so page content
 * (`{children}` + its loading.tsx) streams without waiting on these queries.
 */
async function ShellExtras() {
  const [classGroups, activities, searchIndex] = await Promise.all([
    listClassPickerOptions(),
    listExtracurriculars(),
    getSearchIndex(),
  ]);
  return (
    <>
      <QuickAddFab classGroups={classGroups} activities={activities} />
      <SearchPalette index={searchIndex} />
    </>
  );
}

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

      <Suspense fallback={null}>
        <ShellExtras />
      </Suspense>
    </div>
  );
}
