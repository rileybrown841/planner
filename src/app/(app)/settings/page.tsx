import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { Button, buttonClass } from "@/components/ui/button";
import { DisplayNameForm } from "@/components/display-name-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const storedName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "";

  return (
    <section className="flex max-w-xl flex-col gap-8">
      <h1 className="font-display text-2xl">Settings</h1>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Account</h2>
        <p className="text-sm">
          Signed in as <span className="font-medium">{user.email}</span>
        </p>
        <DisplayNameForm defaultValue={storedName} />
      </div>

      <div className="flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Appearance</h2>
        <ThemeToggle />
      </div>

      <div className="flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Planner</h2>
        <Link
          href="/semesters"
          className={buttonClass({ variant: "secondary", size: "sm", className: "self-start" })}
        >
          Manage semesters
        </Link>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/10">
        <form action={signOut}>
          <Button type="submit" variant="secondary" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </section>
  );
}
