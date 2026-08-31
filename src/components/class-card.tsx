import Link from "next/link";
import { MapPin, User } from "lucide-react";
import type { Class } from "@/lib/types";
import { colorDotStyle } from "@/lib/colors";
import { formatMeeting, sortMeetings } from "@/lib/days";
import { classHref } from "@/lib/routes";

export function ClassCard({ cls }: { cls: Class }) {
  const meetings = sortMeetings(cls.schedule ?? []);

  return (
    <Link
      href={classHref(cls.id)}
      className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white/60 p-4 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full"
          style={colorDotStyle(cls.color)}
        />
        <h3 className="truncate font-semibold">{cls.name}</h3>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
        {cls.code && <span className="font-medium text-zinc-600 dark:text-zinc-400">{cls.code}</span>}
        {cls.instructor && (
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" />
            {cls.instructor}
          </span>
        )}
        {cls.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {cls.location}
          </span>
        )}
      </div>

      {meetings.length > 0 && (
        <p className="text-xs text-zinc-500">
          {meetings.map(formatMeeting).join(" · ")}
        </p>
      )}
    </Link>
  );
}
