import type { CalendarItem } from "@/lib/types";

export type PlacedItem = {
  item: CalendarItem;
  /** minutes from midnight */
  startMin: number;
  endMin: number;
  /** 0-based column within its overlap cluster */
  lane: number;
  laneCount: number;
};

/**
 * Positions timed items for one day column. Items that overlap in time are
 * split into side-by-side lanes; each overlap cluster gets its own lane count.
 * `dayStart` is local midnight of the column's day.
 */
export function layoutDay(items: CalendarItem[], dayStart: Date): PlacedItem[] {
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayStartMs + 86_400_000;

  const timed = items
    .filter((i) => !i.allDay && i.start.getTime() < dayEndMs && (i.end ?? i.start).getTime() > dayStartMs)
    .map((item) => {
      const s = Math.max(item.start.getTime(), dayStartMs);
      const e = Math.min((item.end ?? new Date(item.start.getTime() + 30 * 60_000)).getTime(), dayEndMs);
      return {
        item,
        startMin: Math.round((s - dayStartMs) / 60_000),
        endMin: Math.max(Math.round((e - dayStartMs) / 60_000), Math.round((s - dayStartMs) / 60_000) + 15),
      };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const placed: PlacedItem[] = [];
  let cluster: (typeof timed)[number][] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    // greedy lane assignment
    const laneEnds: number[] = [];
    const lanes = cluster.map((c) => {
      let lane = laneEnds.findIndex((end) => end <= c.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(c.endMin);
      } else {
        laneEnds[lane] = c.endMin;
      }
      return lane;
    });
    const laneCount = laneEnds.length;
    cluster.forEach((c, idx) => {
      placed.push({ ...c, lane: lanes[idx], laneCount });
    });
    cluster = [];
    clusterEnd = -1;
  };

  for (const t of timed) {
    if (cluster.length > 0 && t.startMin >= clusterEnd) flush();
    cluster.push(t);
    clusterEnd = Math.max(clusterEnd, t.endMin);
  }
  flush();

  return placed;
}

/** Hour range to render, derived from the day's timed items (with sane defaults). */
export function hourRange(items: PlacedItem[]): { startHour: number; endHour: number } {
  let startHour = 7;
  let endHour = 21;
  for (const p of items) {
    startHour = Math.min(startHour, Math.floor(p.startMin / 60));
    endHour = Math.max(endHour, Math.ceil(p.endMin / 60));
  }
  return { startHour: Math.max(0, startHour), endHour: Math.min(24, Math.max(endHour, startHour + 1)) };
}
