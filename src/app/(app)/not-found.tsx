import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-8">
      <h1 className="text-xl font-semibold tracking-tight">Not found</h1>
      <p className="text-sm text-zinc-500">
        That page doesn&apos;t exist, or the item was deleted.
      </p>
      <Link href="/today" className={buttonClass({ size: "sm" })}>
        Back to Today
      </Link>
    </section>
  );
}
