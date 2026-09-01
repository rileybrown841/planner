import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { displayName } from "@/lib/user";
import { getDashboardData } from "@/lib/data/dashboard";
import { buttonClass } from "@/components/ui/button";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  const [user, { sources, openTaskCount }] = await Promise.all([
    requireUser(),
    getDashboardData(),
  ]);
  const { activeSemester } = sources;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {displayName(user)}.
        </h1>
        <p className="text-sm text-zinc-500">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {activeSemester ? ` · ${activeSemester.name}` : ""}
        </p>
      </header>

      <Dashboard sources={sources} openTaskCount={openTaskCount} />

      {!activeSemester && (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-5 text-sm dark:border-white/15 dark:bg-white/[0.02]">
          <p className="text-zinc-500">
            No semester is active — set one up to see classes on your dashboard.
          </p>
          <Link href="/semesters/new" className={buttonClass({ size: "sm", className: "mt-2" })}>
            Set up a semester
          </Link>
        </div>
      )}
    </section>
  );
}
