import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { describeSupabaseConfigProblem } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  missing_code: "That sign-in link was incomplete. Request a new one.",
  exchange_failed: "That sign-in link has expired. Request a new one.",
  not_allowed: "That account isn't the owner of this planner.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/today";
  const errorKey = typeof params.error === "string" ? params.error : undefined;
  const initialError = errorKey ? (ERRORS[errorKey] ?? "Something went wrong.") : undefined;
  const configProblem = describeSupabaseConfigProblem();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"
          >
            P
          </span>
          Planner
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-zinc-500">
          Your personal planner. One account, synced across your devices.
        </p>
      </div>

      {configProblem ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">{configProblem}</p>
          <p className="mt-1 text-amber-700/80 dark:text-amber-300/80">
            Edit <code>.env.local</code> (see <code>README.md</code>), then
            restart the dev server.
          </p>
        </div>
      ) : (
        <LoginForm next={next} initialError={initialError} />
      )}
    </main>
  );
}
