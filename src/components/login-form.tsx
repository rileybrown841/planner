"use client";

import { useActionState } from "react";
import {
  signInWithMagicLink,
  type SignInState,
} from "@/lib/actions/auth";

const INITIAL: SignInState = { status: "idle" };

export function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const [state, action, pending] = useActionState(signInWithMagicLink, INITIAL);

  const message = state.message ?? initialError;
  const isError = state.status === "error" || (!!initialError && state.status === "idle");

  if (state.status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
        {state.message}
        <p className="mt-2 text-emerald-700/80 dark:text-emerald-300/80">
          You can close this tab and open the link on any device.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/15 dark:bg-white/5"
        />
      </label>

      {message && (
        <p
          className={
            isError
              ? "text-sm text-red-600 dark:text-red-400"
              : "text-sm text-zinc-500"
          }
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
