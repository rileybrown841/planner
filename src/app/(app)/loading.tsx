/** Instant placeholder while a signed-in page's server render is in flight. */
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden>
      <div className="h-8 w-40 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/[0.05]" />
        <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/[0.05]" />
        <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/[0.05]" />
      </div>
      <div className="h-40 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]" />
      <div className="h-64 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]" />
    </div>
  );
}
