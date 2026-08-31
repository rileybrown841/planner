import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-zinc-500">
        This page hasn&apos;t been cached yet. Reconnect and try again — your data
        lives in the cloud and will sync as soon as you&apos;re back online.
      </p>
    </main>
  );
}
